// app/api/store-key/route.ts
import { NextResponse } from "next/server"
import { encrypt } from "../../../utils/encryption"
import { createClient } from "@supabase/supabase-js"

// Initialize the Supabase client using your server-side credentials.
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { apiKey, provider, userId } = await request.json()

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required and must be a string." },
        { status: 400 }
      )
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required and must be a string." },
        { status: 400 }
      )
    }

    // Encrypt the API key using your encryption function.
    const encryptedKey = encrypt(apiKey)

    // Insert the encrypted API key and provider into Supabase.
    // If your schema requires a user_id, you can either omit it if allowed
    // or insert a default value (like null or a placeholder).
    const { data, error } = await supabase.from("user_api_keys").insert([
      {
        user_id: userId,
        provider: provider,
        encrypted_api_key: encryptedKey,
      },
    ]) // Need changing for user auth

    if (error) {
      console.error("Error storing API key:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error("Error storing API key:", err)
    return NextResponse.json(
      { error: "Failed to store API key." },
      { status: 500 }
    )
  }
}
