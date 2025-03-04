import { createClient } from "@supabase/supabase-js"
import { LoginTemplate, promptNameAndVersion } from "@anyprompt/core"

import { Database } from "@/database.types"
import LoginPageClient from "./page.client"

const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
)

export default async function LoginPage() {
  //replace .select("id, email, name") to .select("*") if you want all entries
  const { data, error } = await supabase.from("Users").select("id, email, name");

  if (error) {
    console.error("Error fetching login data:", error.message);
    return [];
  }

  const login: LoginTemplate[] = data?.map((user) => {
    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      avatar_url: null,
      api_key: null,
      created_at: null,
      updated_at: null,

      // uncomment if you want all entries
      //avatar_url: user.avatar_url,
      // api_key: user.api_key,
      // created_at: user.created_at,
      // updated_at: user.updated_at,
    };
  }) ?? [];

  return <LoginPageClient login={login} />;
}
