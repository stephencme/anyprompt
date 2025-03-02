import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import ProfilePageClient from "./page.client";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

export default async function ProfilePage() {
  // Replace with your own logic to get the current user ID.
  const userId = "some-user-id"; // Placeholder user ID

  // Fetch the user's profile from the "profiles" table.
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
  }

  // If no data is returned, set profile to null.
  const profile = data || null;

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <ProfilePageClient profile={profile} />
    </main>
  );
}
