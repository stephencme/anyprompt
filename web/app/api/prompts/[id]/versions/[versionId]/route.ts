import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  context: { params: { id: string; versionId: string } },
) {
  try {
    const { id: promptId, versionId } = context.params

    const { data: version, error } = await supabase
      .from("prompt_version")
      .select("*")
      .eq("id", versionId)
      .eq("prompt_id", promptId)
      .single()

    if (error) {
      console.error("Error fetching version:", error)
      return NextResponse.json(
        { error: "Failed to fetch version details" },
        { status: 500 },
      )
    }

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    return NextResponse.json(version)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
