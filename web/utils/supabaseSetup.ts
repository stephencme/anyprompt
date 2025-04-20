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
    `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `,
    // Ensure the extensions schema and function are in place
    `CREATE SCHEMA IF NOT EXISTS extensions;`,
    `
    CREATE OR REPLACE FUNCTION extensions.moddatetime()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- TG_ARGV[0] is the first argument passed to the trigger
      EXECUTE format('NEW.%I = now()', TG_ARGV[0]);
      RETURN NEW;
    END;
    $$;
    `,
    // Create the prompt table.
    `
    create table public.prompts (
      created_at timestamp with time zone not null default now(),
      name text not null,
      id uuid not null default gen_random_uuid (),
      updated_at timestamp with time zone null,
      description text null,
      user_id uuid null,
      constraint prompts_pkey primary key (id),
      constraint prompts_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
    ) TABLESPACE pg_default;
    `,
    `
    create trigger handle_updated_at BEFORE
    update on prompts for EACH row
    execute FUNCTION extensions.moddatetime ('updated_at');
    `,
    // Create the prompt_version table.
    `
    create table public.prompt_version (
      id uuid not null default gen_random_uuid (),
      created_at timestamp with time zone not null default now(),
      prompt text null,
      template_variables text[] null,
      prompt_id uuid not null,
      version text not null,
      updated_at timestamp with time zone null,
      constraint prompt_version_pkey primary key (id),
      constraint prompt_version_prompt_id_fkey foreign KEY (prompt_id) references prompts (id) on update CASCADE on delete CASCADE
    ) TABLESPACE pg_default;
    `,
    `
    create trigger handle_updated_at BEFORE
    update on prompt_version for EACH row
    execute FUNCTION extensions.moddatetime ('updated_at');
    `,
    // Create the run_history table.
    `
    create table public.run_history (
      model character varying not null,
      run_result text not null,
      run_timestamp timestamp with time zone not null default now(),
      additional_metadata jsonb not null,
      prompt_version uuid not null,
      id uuid not null default gen_random_uuid (),
      user_prompt text null,
      constraint run_history_pkey primary key (id),
      constraint run_history_prompt_version_fkey foreign KEY (prompt_version) references prompt_version (id) on update CASCADE on delete CASCADE
    ) TABLESPACE pg_default;
    `,
    // Create the user_api_keys table.
    `
    create table public.user_api_keys (
      id uuid not null default gen_random_uuid (),
      user_id uuid not null,
      provider character varying not null,
      encrypted_api_key text not null,
      created_at timestamp with time zone null default timezone ('utc'::text, now()),
      updated_at timestamp with time zone null,
      constraint user_api_keys_pkey primary key (id),
      constraint user_api_keys_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
    ) TABLESPACE pg_default;
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
