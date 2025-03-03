// app/api/run-prompt/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { decrypt } from '../../../utils/encryption';

// Initialize the Supabase client using your server-side credentials.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// A simple function that replaces {{key}} with its corresponding value from parameters.
function fillTemplate(template: string, parameters: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(parameters)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const { userID, promptID, provider, model, parameters } = await request.json();

    if (!userID || !promptID || !provider || !model || !parameters) {
      return NextResponse.json(
        { error: 'Missing required fields: userID, promptID, provider, model, parameters' },
        { status: 400 }
      );
    }

    // Retrieve the user API key from Supabase.
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', userID)
      .eq('provider', provider)
      .single();

    if (apiKeyError || !apiKeyData) {
      return NextResponse.json({ error: 'User API key not found' }, { status: 404 });
    }

    // Decrypt the stored API key.
    console.log(apiKeyData)
    const decrypted_apiKey = decrypt(apiKeyData.encrypted_api_key);

    console.log(decrypted_apiKey)

    // Retrieve the prompt template from Supabase.
    const { data: templateData, error: templateError } = await supabase
      .from('prompt_version')
      .select('*')
      .eq('prompt_id', promptID)
      .single();

    if (templateError || !templateData) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Render the final prompt using the custom templating function.
    const prompt = fillTemplate(templateData.prompt, parameters);

    // Initialize the OpenAI SDK with the user's decrypted API key.
    const client = new OpenAI({
      apiKey: decrypted_apiKey,
    });

    // Call the OpenAI API using the SDK.
    const completion = await client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract the generated text from the API response.
    const generatedText = completion.choices?.[0]?.message.content;

    console.log(generatedText)
    console.log(promptID)

    // Store the result in the Supabase "run_history" table.
    const { data: resultData, error: insertError } = await supabase
      .from('run_history')
      .insert([
        {
          model: model,
          run_result: generatedText,
          additional_metadata: completion.choices?.[0]?.message,
          prompt_version: templateData.id
        },
      ]);

    if (insertError) {
      console.error('Insert error details:', insertError);
      return NextResponse.json({ error: 'Failed to store result in database' }, { status: 500 });
    }

    // Return the generated message to the client.
    return NextResponse.json({ result: completion.choices[0].message }, { status: 200 });
  } catch (err) {
    console.error('Error running prompt:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
