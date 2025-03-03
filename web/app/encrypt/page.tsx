"use client";
import { useState, FormEvent } from "react";

export default function EncryptDecryptPage() {
  // Encryption state
  const [encryptInput, setEncryptInput] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const [encryptError, setEncryptError] = useState("");

  // Decryption state
  const [decryptInput, setDecryptInput] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [decryptError, setDecryptError] = useState("");

  const handleEncryptSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEncryptError("");
    setEncrypted("");

    try {
      const response = await fetch("/api/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: encryptInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        setEncryptError(data.error || "Encryption failed.");
      } else {
        setEncrypted(data.encrypted);
      }
    } catch (err) {
      setEncryptError("An error occurred.");
    }
  };

  const handleDecryptSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDecryptError("");
    setDecrypted("");

    try {
      const response = await fetch("/api/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encrypted: decryptInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        setDecryptError(data.error || "Decryption failed.");
      } else {
        setDecrypted(data.decrypted);
      }
    } catch (err) {
      setDecryptError("An error occurred.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Encryption and Decryption</h1>
      
      {/* Encryption Section */}
      <div style={{ marginBottom: "40px" }}>
        <h2>Encrypt a Message</h2>
        <form onSubmit={handleEncryptSubmit}>
          <label>
            Enter your message:{" "}
            <input
              type="text"
              value={encryptInput}
              onChange={(e) => setEncryptInput(e.target.value)}
              style={{ marginLeft: "10px", width: "300px" }}
            />
          </label>
          <button type="submit" style={{ marginLeft: "10px" }}>
            Encrypt
          </button>
        </form>
        {encrypted && (
          <div>
            <h3>Encrypted Message:</h3>
            <p>{encrypted}</p>
          </div>
        )}
        {encryptError && (
          <div style={{ color: "red", marginTop: "10px" }}>
            <p>{encryptError}</p>
          </div>
        )}
      </div>
      
      {/* Decryption Section */}
      <div>
        <h2>Decrypt a Message</h2>
        <form onSubmit={handleDecryptSubmit}>
          <label>
            Enter the encrypted message:{" "}
            <input
              type="text"
              value={decryptInput}
              onChange={(e) => setDecryptInput(e.target.value)}
              style={{ marginLeft: "10px", width: "300px" }}
            />
          </label>
          <button type="submit" style={{ marginLeft: "10px" }}>
            Decrypt
          </button>
        </form>
        {decrypted && (
          <div>
            <h3>Decrypted Message:</h3>
            <p>{decrypted}</p>
          </div>
        )}
        {decryptError && (
          <div style={{ color: "red", marginTop: "10px" }}>
            <p>{decryptError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
