"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";

type SupabaseConfig = {
  url: string;
  anonKey: string;
};

type SignupTemplateType = {
  title: string;
  description?: string;
};

interface SignupPageClientProps {
  supabaseConfig: SupabaseConfig;
  signupTemplate: SignupTemplateType;
}

export default function SignupPageClient({ supabaseConfig, signupTemplate }: SignupPageClientProps) {
  // Initialize the client on the client side using the passed config
  const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey);

  // ... rest of your component (same as before)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Signup successful! Please check your email for confirmation.");
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
      <h2>{signupTemplate.title}</h2>
      {signupTemplate.description && <p>{signupTemplate.description}</p>}
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: ".5rem" }}>
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: ".5rem" }}>
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "0.5rem 1rem" }}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      {message && (
        <p style={{ marginTop: "1rem", color: message.includes("successful") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}
