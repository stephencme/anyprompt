"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

import { Database } from "@/database.types"
import { useRouter } from "next/navigation";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
)

const ConfirmEmail = () => {
  const router = useRouter();

  useEffect(() => {
    const url = window.location.href;
    const params = new URLSearchParams(url.split("#")[1]);
    const access_token = params.get("access_token"); // Get the access token from the URL
    const refresh_token = params.get("refresh_token");  // Get the refresh token from the URL (if available)

    if (access_token && refresh_token) {
      // successful authentication
      // Set both access_token and refresh_token
      supabase.auth.setSession({
        access_token: access_token,
        refresh_token: refresh_token,
      })
        .then(() => {
          // Handle the successful authentication
          router.push('/prompts'); // Redirect to prompt
        })
        // unsuccessful authentication
        .catch((error) => {
          console.error('Error setting session:', error.message);
        });
    }
  }, [router]);

  return <div>Verifying...</div>;
};

export default ConfirmEmail;