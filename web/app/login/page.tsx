import { createClient } from "@supabase/supabase-js"
import { LoginTemplate, promptNameAndVersion } from "@anyprompt/core"

import { Database } from "@/database.types"
import LoginPageClient from "./page.client"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
)

export default async function LoginPage() {
  const { data, error } = await supabase.from("Users").select("id, email");

  if (error) {
    console.error("Error fetching login data:", error.message);
    return [];
  }

  const login: LoginTemplate[] = data?.map((user) => {
    return {
      id: user.id.toString(),
      email: user.email,
      // name: user.name,
    };
  }) ?? [];

  return <LoginPageClient login={login} />;
}
