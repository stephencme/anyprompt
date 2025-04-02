"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// utils/generateSecretKey.ts
var crypto_ts_1 = require("crypto-ts");
// Generate a 128-bit (16-byte) random key
var secretKey = crypto_ts_1.lib.WordArray.random(16);
// Convert the key to a hex string for display/storage
console.log('Your secret key:', secretKey.toString());
