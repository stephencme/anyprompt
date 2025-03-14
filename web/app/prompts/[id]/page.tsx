import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import PromptClient from "./page.client"
import { Database } from "@/database.types"

interface PageParams {
  params: {
    id: string
  }
}

export default async function PromptPage({ params }: PageParams) {
  // Extract and validate id from params - no longer accessing it directly multiple times
  const id = params.id

  const supabase = createClient<Database>(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_ANON_KEY ?? ""
  )

  // Fetch the prompt data with the validated id
  const { data: prompt, error: promptError } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", id)
    .single()

  const { data: versions, error: versionsError } = await supabase
    .from("prompt_version")
    .select("*")
    .eq("prompt_id", id)
    .order("created_at", { ascending: false })

  if (promptError || !prompt) {
    console.error("Error fetching prompt:", promptError)
    return redirect("/prompts")
  }

  if (versionsError || !versions) {
    console.error("Error fetching versions:", versionsError)
    return redirect("/prompts")
  }

  return (
    <div className="container mx-auto px-8 py-6">
      <PromptClient id={id} prompt={prompt} versions={versions ?? []} />
    </div>
  )
}
