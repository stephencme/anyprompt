import { createClient } from "@supabase/supabase-js"
import { Database } from "@/database.types"
import { NextResponse } from "next/server"

const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
)

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id

    // First delete all versions of the prompt
    const { error: versionsError } = await supabase
      .from("prompt_version")
      .delete()
      .eq("prompt_id", promptId)

    if (versionsError) {
      console.error("Error deleting prompt versions:", versionsError)
      return NextResponse.json(
        { error: "Failed to delete prompt versions" },
        { status: 500 }
      )
    }

    // Then delete the prompt itself
    const { error: promptError } = await supabase
      .from("prompts")
      .delete()
      .eq("id", promptId)

    if (promptError) {
      console.error("Error deleting prompt:", promptError)
      return NextResponse.json(
        { error: "Failed to delete prompt" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

// We'll also need a PUT endpoint for updating prompts
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id
    const body = await request.json()
    const { name, description, template, version, templateVariables } = body

    // Validation
    if (!name || !template || !version) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Update the prompt
    const { error: promptError } = await supabase
      .from("prompts")
      .update({ name, description })
      .eq("id", promptId)

    if (promptError) {
      console.error("Error updating prompt:", promptError)
      return NextResponse.json(
        { error: "Failed to update prompt" },
        { status: 500 }
      )
    }

    // Update or create the version
    const { data: existingVersion } = await supabase
      .from("prompt_version")
      .select("id")
      .eq("prompt_id", promptId)
      .eq("version", version)
      .single()

    if (existingVersion) {
      // Update existing version
      const { error: versionError } = await supabase
        .from("prompt_version")
        .update({
          prompt: template,
          template_variables: templateVariables,
        })
        .eq("id", existingVersion.id)

      if (versionError) {
        console.error("Error updating prompt version:", versionError)
        return NextResponse.json(
          { error: "Failed to update prompt version" },
          { status: 500 }
        )
      }
    } else {
      // Create new version
      const { error: versionError } = await supabase
        .from("prompt_version")
        .insert([
          {
            prompt: template,
            template_variables: templateVariables,
            prompt_id: promptId,
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
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
