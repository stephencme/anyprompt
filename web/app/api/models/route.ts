import { NextResponse } from "next/server"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { decrypt } from "@/utils/encryption"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const provider = searchParams.get("provider")

    console.log("userId", userId)
    console.log("provider", provider)

    if (!userId || !provider) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      )
    }

    // Get the user's API key from Supabase
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", provider)
      .single()

    if (apiKeyError || !apiKeyData) {
      return NextResponse.json(
        {
          error:
            "Please add your API key in the settings page to access models",
          errorType: "missing_api_key",
        },
        { status: 404 },
      )
    }

    // Decrypt the API key
    const decryptedApiKey = decrypt(apiKeyData.encrypted_api_key)

    let models: string[] = []

    if (provider === "OpenAI") {
      const openai = new OpenAI({
        apiKey: decryptedApiKey,
      })

      const response = await openai.models.list()
      models = response.data
        .map((model) => model.id)
        .filter((id) => id.startsWith("gpt-"))
    } else if (provider === "Anthropic") {
      const anthropic = new Anthropic({
        apiKey: decryptedApiKey,
      })

      const response = await anthropic.models.list()
      models = response.data.map((model) => model.id)
    }

    return NextResponse.json({ models })
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 },
    )
  }
}
