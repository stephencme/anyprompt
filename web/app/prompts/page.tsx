import { createClient } from "@supabase/supabase-js"
import { PromptTemplate, promptNameAndVersion } from "@anyprompt/core"

import { Database } from "@/database.types"
import PromptsPageClient from "./page.client"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
)

async function selectPrompts() {
  return supabase.from("prompts").select("*")
}

export default async function PromptsPage() {
  const { data } = await selectPrompts()
  const prompts: PromptTemplate[] =
    data?.map((prompt) => {
      const [name, version] = promptNameAndVersion(prompt.id)
      return {
        id: prompt.id,
        name,
        version,
        template: prompt.template,
      }
    }) ?? []

  return <PromptsPageClient prompts={prompts} />
}
