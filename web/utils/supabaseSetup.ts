// utils/supabaseSetup.ts

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
// Load environment variables from .env.local (or your chosen env file)
dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase URL or service role key in your environment variables.",
  )
}

// Initialize the Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

/**
 * Iteratively execute multiple SQL commands by calling the existing RPC.
 */
async function createTables() {
  // Array of SQL statements to create various tables.
  const sqlStatements = [
    // Create the user table.
    `
    CREATE TABLE IF NOT EXISTS Users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL,
      name text,
      avatar_url text,
      api_key text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz
    );
    `,
    // Create the prompt table.
    `
    CREATE TABLE IF NOT EXISTS prompt (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES Users(id) ON DELETE SET NULL,
      name text NOT NULL,
      description text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz
    );
    `,
    // Create the prompt_version table.
    `
    CREATE TABLE IF NOT EXISTS prompt_version (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt_id uuid REFERENCES prompt(id) ON DELETE SET NULL,
      version text NOT NULL,
      prompt text NOT NULL,
      template_variable text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz
    );
    `,
    // Create the run_history table.
    `
    CREATE TABLE IF NOT EXISTS run_history (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt_version uuid REFERENCES prompt_version(id) ON DELETE SET NULL,
      variable text NOT NULL,
      model varchar,
      run_result text,
      run_timestamp timestamptz DEFAULT now(),
      additional_metadata jsonb
    );
    `,
    // Create the user_api_keys table.
    `
    CREATE TABLE IF NOT EXISTS user_api_keys (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES Users(id) ON DELETE SET NULL,
      variable text NOT NULL,
      encrypted_api_key text,
      model varchar,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz
    );
    `,
    // You can add additional SQL commands as needed.
  ]

  // Iterate over each command, calling the RPC each time.
  for (const sql of sqlStatements) {
    const { data, error } = await supabase.rpc("execute_sql", { sql })
    if (error) {
      console.error("Error executing SQL:", error, "\nSQL:", sql)
      // Optionally break or continue based on your error-handling strategy.
      continue
    }
    console.log("Successfully executed command:", sql)
  }
}

async function setupDatabase() {
  console.log("Starting database setup...")
  await createTables()
  console.log("Database setup complete.")
}

// Run the script
setupDatabase().catch((err) => {
  console.error("Setup encountered an error:", err)
  process.exit(1)
})
