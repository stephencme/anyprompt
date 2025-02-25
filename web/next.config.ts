require('dotenv').config();
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
}

export default nextConfig
