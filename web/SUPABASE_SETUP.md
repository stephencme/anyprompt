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

Create the prompt table.

```sql
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

create trigger handle_updated_at BEFORE
update on prompts for EACH row
execute FUNCTION extensions.moddatetime ('updated_at');
```

Create the prompt_version table

```sql
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

create trigger handle_updated_at BEFORE
update on prompt_version for EACH row
execute FUNCTION extensions.moddatetime ('updated_at');
```

Create the run_history table.

```sql
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
```

Create the user_api_keys table

```sql
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
