import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import ProfilePageClient from "./page.client";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

export default async function ProfilePage() {
  const user = (await supabase.auth.getSession()).data.session?.user;
    if (!user) {
      return <div>User not found</div>
    }

    const { data, error } = await supabase.from("Users").select("*").eq("id", user.id).single()
    if(error){
      return <div>Error retreiving user data</div>
    }

    const profile = data;
  
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <ProfilePageClient profile={profile} />
    </main>
  );
}
