import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: { id: string; versionId: string } },
) {
  try {
    const { id: promptId, versionId } = params

    // First verify that the version belongs to this prompt
    const { data: version, error: versionError } = await supabase
      .from("prompt_version")
      .select("id")
      .eq("id", versionId)
      .eq("prompt_id", promptId)
      .single()

    if (versionError) {
      console.error("Version verification error:", versionError)
      return NextResponse.json(
        { error: "Failed to verify version" },
        { status: 500 },
      )
    }

    if (!version) {
      return NextResponse.json(
        { error: "Version not found or does not belong to this prompt" },
        { status: 404 },
      )
    }

    // Fetch run history for this version
    const { data: runs, error: runsError } = await supabase
      .from("run_history")
      .select("*")
      .eq("prompt_version", versionId)
      .order("run_timestamp", { ascending: false })

    if (runsError) {
      console.error("Error fetching run history:", runsError)
      return NextResponse.json(
        { error: "Failed to fetch run history" },
        { status: 500 },
      )
    }

    return NextResponse.json(runs || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
