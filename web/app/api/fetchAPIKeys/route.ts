// app/api/get-all-keys/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt, maskApiKey } from '../../../utils/encryption';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  const { data, error } = await supabase
    .from('user_api_keys')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Decrypt each stored API key and then mask the decrypted value.
  const keys = data.map((record: any) => {
    const decrypted = decrypt(record.encrypted_api_key);
    const masked = maskApiKey(decrypted);
    return {
      id: record.id,
      provider: record.provider,
      masked_api_key: masked,
      created_at: record.created_at,
    };
  });

  return NextResponse.json({ keys }, { status: 200 });
}
