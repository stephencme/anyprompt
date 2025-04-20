import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    //get user id from url
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    if(!userId){
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 },
      )
    }


    const { data: prompts, error: promptsError } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", userId)

    if (promptsError) {
      console.error("Error fetching prompts:", promptsError)
      return NextResponse.json(
        { error: "Failed to fetch prompts" },
        { status: 500 },
      )
    }

    // Now get versions for each prompt
    const promptsWithVersions = await Promise.all(
      prompts.map(async (prompt) => {
        const { data: versions, error: versionsError } = await supabase
          .from("prompt_version")
          .select("version, prompt, template_variables")
          .eq("prompt_id", prompt.id)
          .order("created_at", { ascending: false })

        if (versionsError) {
          console.error(
            `Error fetching versions for prompt ${prompt.id}:`,
            versionsError,
          )
          return {
            ...prompt,
            versions: [],
          }
        }

        return {
          ...prompt,
          versions: versions.map((v) => ({
            version: v.version,
            prompt: v.prompt,
            template_variables: v.template_variables,
          })),
        }
      }),
    )

    return NextResponse.json(promptsWithVersions)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    //get user id from url
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    if(!userId){
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 },
      )
    }

    const body = await request.json()
    const { name, description, template, version, templateVariables } = body

    // Validation
    if (!name || !template || !version) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    // First, create the prompt
    const { data: promptData, error: promptError } = await supabase
      .from("prompts")
      .insert([{ name: name, description: description, user_id: userId }])
      .select("id")
      .single()

    if (promptError) {
      console.error("Error creating prompt:", promptError)
      return NextResponse.json(
        { error: "Failed to create prompt" },
        { status: 500 },
      )
    }

    // Then create the prompt version
    const { error: versionError } = await supabase
      .from("prompt_version")
      .insert([
        {
          prompt: template,
          template_variables: templateVariables,
          prompt_id: promptData.id,
          version,
        },
      ])

    if (versionError) {
      console.error("Error creating prompt version:", versionError)
      return NextResponse.json(
        { error: "Failed to create prompt version" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, id: promptData.id })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
