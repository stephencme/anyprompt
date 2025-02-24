import { createClient } from "@supabase/supabase-js"
import { EmailConfirmedTemplate} from "@anyprompt/core"

import { Database } from "@/database.types"
import EmailConfirmedPageClient from "./page.client"

const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
)

export default async function EmailConfirmedPage() {

  return <EmailConfirmedPageClient/>;
}
