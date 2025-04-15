// app/api/store-key/route.ts
import { NextResponse } from "next/server"
import { encrypt } from "../../../utils/encryption"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { apiKey, provider, userId } = await request.json()

    // Validate required fields
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing user ID" },
        { status: 400 },
      )
    }

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 400 },
      )
    }

    if (!provider || typeof provider !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing provider" },
        { status: 400 },
      )
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey)

    // Check if a key already exists for this user and provider
    const { data: existingKey } = await supabase
      .from("user_api_keys")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", provider)
      .single()

    // Update or insert the API key
    const { error } = await supabase.from("user_api_keys").upsert({
      id: existingKey?.id, // Include the ID if it exists for update
      user_id: userId,
      provider: provider,
      encrypted_api_key: encryptedKey,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error storing API key:", error)
      return NextResponse.json(
        { error: "Failed to store API key" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in storeAPIKey:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
