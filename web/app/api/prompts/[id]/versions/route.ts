import { createClient } from "@supabase/supabase-js"
import { Database } from "@/database.types"
import { NextResponse } from "next/server"

const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
)

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id
    const body = await request.json()
    const { version, prompt, templateVariables } = body

    // Validation
    if (!version || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if version already exists
    const { data: existingVersion } = await supabase
      .from("prompt_version")
      .select("id")
      .eq("prompt_id", promptId)
      .eq("version", version)
      .single()

    if (existingVersion) {
      return NextResponse.json(
        { error: "Version already exists" },
        { status: 400 }
      )
    }

    // Create the new version
    const { data, error } = await supabase
      .from("prompt_version")
      .insert([
        {
          prompt,
          template_variables: templateVariables,
          prompt_id: promptId,
          version,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating prompt version:", error)
      return NextResponse.json(
        { error: "Failed to create prompt version" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
