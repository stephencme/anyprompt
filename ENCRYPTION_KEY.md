# Generating an Encryption Key for API key Encryption

This guide will help you generate a secure encryption key for your application.

## Prerequisites

Install `tsc` by running one of the following commands:
  ```bash
  # for global installation
  npm install -g typescript 
  
  # for local installation
  npm install --save-dev typescript 
  ```

## Steps to Generate an Encryption Key

1. Open your terminal/command prompt

2. Navigate to the project's root directory

3. Run the following command to generate a random encryption key:
   ```bash
    tsc web/utils/generateSecretKey.ts

    node web/utils/generateSecretKey.js
   ```

4. The script will output a 32-character hexadecimal string. This is your encryption key. Example:
   ```bash
    Your secret key: <Secret Key>
   ```

5. Copy the generated key and add it to your environment variables:
   ```bash
   # For development (add to .env)
   ENCRYPTION_SECRET_KEY=your_generated_key_here
   ```

## Important Notes

- Keep your encryption key secure and never commit it to version control
- The key is 128-bit (16 bytes) and will be displayed as a 32-character hexadecimal string
- If you lose this key, you will not be able to decrypt any previously encrypted data
- Make sure to use the same key across all environments (development, staging, production)
