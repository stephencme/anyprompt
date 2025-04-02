// web/app/api/encrypt/route.ts
import { NextResponse } from 'next/server';
import { encrypt } from '../../../utils/encryption';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required and must be a string.' }, { status: 400 });
    }
    const encrypted = encrypt(message);
    return NextResponse.json({ encrypted }, { status: 200 });
  } catch (error) {
    console.error('Encryption error:', error);
    return NextResponse.json({ error: 'Encryption failed.' }, { status: 500 });
  }
}
