// app/api/get-all-keys/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { decrypt, maskApiKey } from "../../../utils/encryption"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
  try {
    // Get the user ID from the query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      )
    }

    // Fetch API keys for the specific user
    const { data, error } = await supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching API keys:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ keys: [] }, { status: 200 })
    }

    // Process each key
    const processedKeys = data.map((record: any) => {
      const decrypted = decrypt(record.encrypted_api_key)
      const masked = maskApiKey(decrypted)
      return {
        id: record.id,
        provider: record.provider,
        masked_api_key: masked,
        created_at: record.created_at,
      }
    })

    return NextResponse.json({ keys: processedKeys }, { status: 200 })
  } catch (err) {
    console.error("Error in fetchAPIKeys:", err)
    return NextResponse.json(
      { error: "Failed to fetch API keys." },
      { status: 500 }
    )
  }
}
