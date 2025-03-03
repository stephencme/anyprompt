"use client";

import React, { useState, useEffect } from "react";

// for the profile data
type Profile = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  api_key?: string | null;
};

type ApiKeyRecord = {
  id: string;
  provider: string;
  masked_api_key: string;
  created_at: string;
};

interface ProfilePageClientProps {
  profile: Profile | null;
}

export default function ProfilePageClient({ profile }: ProfilePageClientProps) {
  // State for the API key update form
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  // State for the list of stored API keys
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch stored API keys from /api/fetchAPIKeys
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

  // Fetch keys on component mount
  useEffect(() => {
    fetchKeys();
  }, []);

  // Handle form submission to store and update an API key
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage("");
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
        setStatusMessage("API key stored successfully!");
        setApiKey("");
        setProvider("");
        fetchKeys(); // refresh list after successful update
      }
    } catch (err: any) {
      setError("An error occurred while storing the API key.");
    }
  };

  if (!profile) {
    return <div>No profile data found.</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Your Profile</h1>
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
        }}
      >
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="Profile Avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              display: "block",
              margin: "0 auto 1rem",
            }}
          />
        )}
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Current API Key:</strong> {profile.api_key ? profile.api_key : "Not set"}
        </p>
      </div>

      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Store/Update Your API Key</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="provider" style={{ display: "block", marginBottom: ".5rem" }}>
              Provider:
            </label>
            <input
              id="provider"
              type="text"
              placeholder="e.g. OpenAI"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="apiKey" style={{ display: "block", marginBottom: ".5rem" }}>
              API Key:
            </label>
            <input
              id="apiKey"
              type="text"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#FFC107",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Store API Key
          </button>
        </form>
        {statusMessage && (
          <p style={{ marginTop: "1rem", color: "green", textAlign: "center" }}>{statusMessage}</p>
        )}
        {error && (
          <p style={{ marginTop: "1rem", color: "red", textAlign: "center" }}>{error}</p>
        )}
      </div>

      <div>
        <h2>Stored API Keys</h2>
        {loading ? (
          <p>Loading...</p>
        ) : keys.length === 0 ? (
          <p>No API keys stored.</p>
        ) : (
          <table border={1} cellPadding={10} cellSpacing={0} style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Provider</th>
                <th>Masked API Key</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id}>
                  <td>{key.id}</td>
                  <td>{key.provider}</td>
                  <td>{key.masked_api_key}</td>
                  <td>{key.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
