import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import ProfilePageClient from "./page.client";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

export default async function ProfilePage() {
  // Replace with your real authentication mechanism to obtain the current user ID.
  const userId = "some-user-id"; // Placeholder: update with actual user ID

  const { data, error } = await supabase
    .from("profiles") //table within database
    .select("id, email, name, avatar_url, api_key")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
  }

  const profile = data || null;

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <ProfilePageClient profile={profile} />
    </main>
  );
}
