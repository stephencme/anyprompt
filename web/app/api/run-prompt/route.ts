// app/api/run-prompt/route.ts
import { NextResponse } from "next/server"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { decrypt } from "../../../utils/encryption"
import { supabase } from "@/lib/supabase"

// A simple function that replaces {{key}} with its corresponding value from parameters.
function fillTemplate(
  template: string,
  parameters: Record<string, string>,
): string {
  let result = template
  for (const [key, value] of Object.entries(parameters)) {
    const regex = new RegExp(`{{${key}}}`, "g")
    result = result.replace(regex, value)
  }
  return result
}

export async function POST(request: Request) {
  try {
    const { userID, promptID, provider, model, parameters } =
      await request.json()

    if (!userID || !promptID || !provider || !model || !parameters) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userID, promptID, provider, model, parameters",
        },
        { status: 400 },
      )
    }

    // Retrieve the user API key from Supabase.
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", userID)
      .eq("provider", provider)
      .single()

    if (apiKeyError || !apiKeyData) {
      return NextResponse.json(
        { error: "User API key not found" },
        { status: 404 },
      )
    }

    // Decrypt the stored API key.
    const decrypted_apiKey = decrypt(apiKeyData.encrypted_api_key)

    // Retrieve the prompt template from Supabase.
    const { data: templateData, error: templateError } = await supabase
      .from("prompt_version")
      .select("*")
      .eq("id", promptID)
      .single()

    if (templateError || !templateData || !templateData.prompt) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Render the final prompt using the custom templating function.
    const prompt = fillTemplate(templateData.prompt, parameters)

    let generatedText
    let completion

    if (provider === "OpenAI") {
      // Initialize the OpenAI SDK with the user's decrypted API key.
      const client = new OpenAI({
        apiKey: decrypted_apiKey,
      })

      // Call the OpenAI API using the SDK.
      completion = await client.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
      })

      // Extract the generated text from the API response.
      generatedText = completion.choices?.[0]?.message.content
    } else if (provider === "Anthropic") {
      const anthropic = new Anthropic({
        apiKey: decrypted_apiKey,
      })

      completion = await anthropic.messages.create({
        model: model,
        max_tokens: 1000,
        temperature: 1,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      })

      generatedText =
        completion.content[0].type === "text" ? completion.content[0].text : ""
    }

    if (!completion) {
      return NextResponse.json(
        { error: "Failed to get completion from provider" },
        { status: 500 },
      )
    }

    const additional_metadata = JSON.stringify(
      provider === "OpenAI" && "choices" in completion
        ? completion.choices?.[0]?.message
        : completion,
    )

    // Store the result in the Supabase "run_history" table.
    const { error: insertError } = await supabase.from("run_history").insert({
      model: model,
      run_result: generatedText || "",
      additional_metadata,
      prompt_version: templateData.id,
      user_prompt: prompt,
    })

    if (insertError) {
      console.error("Insert error details:", insertError)
      return NextResponse.json(
        { error: "Failed to store result in database" },
        { status: 500 },
      )
    }

    // Return the generated message to the client.
    return NextResponse.json(
      {
        result:
          completion && provider === "OpenAI" && "choices" in completion
            ? completion.choices[0].message
            : completion,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("Error running prompt:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
