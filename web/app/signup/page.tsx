import { createClient } from "@supabase/supabase-js"
import { SignupTemplate } from "@anyprompt/core"

import { Database } from "@/database.types"
import SignupPageClient from "./page.client"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
)

export default async function SignupPage() {

  return <SignupPageClient/>
}
