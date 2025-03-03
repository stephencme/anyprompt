// utils/encryption.ts
var CryptoTS = require("crypto-ts");

const secretKey = CryptoTS.enc.Hex.parse(process.env.ENCRYPTION_SECRET_KEY);

/**
 * Encrypts a given API key.
 *
 * @param apiKey - The user API key to encrypt.
 * @returns The encrypted API key in the format "iv:encryptedData" (both in hex).
 */
export function encrypt(apiKey: string): string {
    var ciphertext = CryptoTS.AES.encrypt(apiKey, secretKey);
    return ciphertext.toString();;
  }

  /**
 * Decrypts the provided data which is in the format "iv:encryptedData".
 *
 * @param data - The string containing the IV and encrypted data separated by a colon.
 * @returns The decrypted user API Key.
 */
export function decrypt(data: string): string {
    var bytes  = CryptoTS.AES.decrypt(data.toString(), secretKey);
    var plaintext = bytes.toString(CryptoTS.enc.Utf8);
    
    return plaintext;
  }

export function maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) return apiKey;
    return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
  }