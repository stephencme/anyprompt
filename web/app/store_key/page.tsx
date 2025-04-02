"use client";
import { useState, useEffect, FormEvent } from "react";

interface ApiKeyRecord {
  id: string;
  provider: string;
  masked_api_key: string;
  created_at: string;
}

export default function StoreKeyPage() {
  // Form state for storing a new API key.
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // State for the list of stored keys.
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle form submission for storing an API key.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/storeAPIKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, provider }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to store API key.");
      } else {
        setMessage("API key stored successfully!");
        // Clear form inputs.
        setApiKey("");
        setProvider("");
        // Refresh the list of stored keys.
        fetchKeys();
      }
    } catch (err) {
      setError("An error occurred while storing the API key.");
    }
  };

  // Fetch all stored API keys.
  const fetchKeys = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fetchAPIKeys");
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to fetch API keys.");
      } else {
        setKeys(data.keys);
      }
    } catch (err) {
      setError("An error occurred while fetching API keys.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch keys on component mount.
  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Store Your API Key</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Provider:{" "}
            <input
              type="text"
              placeholder="e.g. OpenAI"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{ marginLeft: "10px", width: "300px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            API Key:{" "}
            <input
              type="text"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ marginLeft: "10px", width: "300px" }}
            />
          </label>
        </div>
        <button type="submit">Store API Key</button>
      </form>
      {message && (
        <div style={{ marginTop: "20px", color: "green" }}>
          <p>{message}</p>
        </div>
      )}
      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <p>{error}</p>
        </div>
      )}

      <hr style={{ marginTop: "40px", marginBottom: "20px" }} />

      <h2>Stored API Keys</h2>
      {loading ? (
        <p>Loading...</p>
      ) : keys.length === 0 ? (
        <p>No API keys stored.</p>
      ) : (
        <table border={1} cellPadding={10} cellSpacing={0}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Provider</th>
              <th>API Key (Masked)</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td>{key.id}</td>
                <td>{key.provider}</td>
                {/* Use the masked_api_key directly */}
                <td>{key.masked_api_key}</td>
                <td>{key.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
