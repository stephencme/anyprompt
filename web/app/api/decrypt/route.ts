// app/api/decrypt/route.ts
import { NextResponse } from 'next/server';
import { decrypt } from '../../../utils/encryption';

export async function POST(request: Request) {
  try {
    const { encrypted } = await request.json();
    if (!encrypted || typeof encrypted !== 'string') {
      return NextResponse.json(
        { error: 'Encrypted message is required and must be a string.' },
        { status: 400 }
      );
    }
    const decrypted = decrypt(encrypted);
    return NextResponse.json({ decrypted }, { status: 200 });
  } catch (error) {
    console.error('Decryption error:', error);
    return NextResponse.json({ error: 'Decryption failed.' }, { status: 500 });
  }
}
