# Supabase Database Setup Guide

This guide will help you set up the required Supabase databases and tables for the AnyPrompt project.

## Prerequisites

1. A Supabase account (create one at [supabase.com](https://supabase.com))
2. A new Supabase project created
3. Added Supabse URL and SUPABASE_SERVICE_ROLE_KEY to the `.env` file. (SUPABASE_SERVICE_ROLE_KEY can be found under the Project Settings/Data API page)

## Using the Setup Script

1. Head to Supabase SQL Editor to create an execution function using the code below:

```sql
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

```

2. Run the setup script:

```bash
cd web
tsc utils/supabaseSetup.ts
node utils/supabaseSetup.js
```

## Manual Setup

If you prefer to set up the database manually:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each table creation SQL from below in the same order
4. Run each SQL query in sequence

### Table creation SQL

Create the user table.

```sql
CREATE TABLE IF NOT EXISTS Users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  avatar_url text,
  api_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);
```

Create the prompt table.

```sql
CREATE TABLE IF NOT EXISTS prompt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES Users(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);
```

Create the prompt_version table

```sql
CREATE TABLE IF NOT EXISTS prompt_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompt(id) ON DELETE SET NULL,
  version text NOT NULL,
  prompt text NOT NULL,
  template_variable text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);
```

Create the run_history table.

```sql
CREATE TABLE IF NOT EXISTS run_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_version uuid REFERENCES prompt_version(id) ON DELETE SET NULL,
  variable text NOT NULL,
  model varchar,
  run_result text,
  run_timestamp timestamptz DEFAULT now(),
  additional_metadata jsonb
);
```

Create the user_api_keys table

```sql
CREATE TABLE IF NOT EXISTS user_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES Users(id) ON DELETE SET NULL,
  variable text NOT NULL,
  encrypted_api_key text,
  model varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);
```

## Troubleshooting

Common issues and solutions:

1. **Foreign Key Constraints**
   - Make sure to create tables in the correct order
   - Check that referenced IDs exist

2. **Permission Issues**
   - Verify that RLS is enabled on all tables
   - Check that policies are correctly defined
   - Ensure the user is authenticated

For additional help, please refer to the [Supabase Documentation](https://supabase.com/docs) or create an issue in the repository.
