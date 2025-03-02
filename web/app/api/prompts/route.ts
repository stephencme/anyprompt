import { createClient } from "@supabase/supabase-js"
import { Database } from "@/database.types"
import { NextResponse } from "next/server"

// Initialize Supabase client with server-side credentials
const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
)

export async function GET() {
  try {
    // First, get all prompts
    const { data: prompts, error: promptsError } = await supabase
      .from("prompts")
      .select("*")

    if (promptsError) {
      console.error("Error fetching prompts:", promptsError)
      return NextResponse.json(
        { error: "Failed to fetch prompts" },
        { status: 500 }
      )
    }

    // Now get versions for each prompt
    const promptsWithVersions = await Promise.all(
      prompts.map(async (prompt) => {
        const { data: versions, error: versionsError } = await supabase
          .from("prompt_version")
          .select("version")
          .eq("prompt_id", prompt.id)
          .order("created_at", { ascending: false })

        if (versionsError) {
          console.error(
            `Error fetching versions for prompt ${prompt.id}:`,
            versionsError
          )
          return {
            ...prompt,
            versions: [],
          }
        }

        return {
          ...prompt,
          versions: versions.map((v) => v.version),
        }
      })
    )

    return NextResponse.json(promptsWithVersions)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, template, version, templateVariables } = body

    // Validation
    if (!name || !template || !version) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // First, create the prompt
    const { data: promptData, error: promptError } = await supabase
      .from("prompts")
      .insert([{ name, description }])
      .select("id")
      .single()

    if (promptError) {
      console.error("Error creating prompt:", promptError)
      return NextResponse.json(
        { error: "Failed to create prompt" },
        { status: 500 }
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
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: promptData.id })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
