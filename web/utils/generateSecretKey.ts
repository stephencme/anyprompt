// utils/generateSecretKey.ts
import { lib } from 'crypto-ts';

// Generate a 128-bit (16-byte) random key
const secretKey = lib.WordArray.random(16);

// Convert the key to a hex string for display/storage
console.log('Your secret key:', secretKey.toString());