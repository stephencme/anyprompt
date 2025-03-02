"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SignupTemplate } from "@anyprompt/core";

import { Database } from "@/database.types"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
)

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError(null);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setMessage("");

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/email-confirmed",
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for confirmation!");
    }

    if (data?.user) {
      // Insert the user profile into your custom table `Users`
      const { error: insertError } = await supabase
        .from("Users")
        .insert([
          {
            id: data.user.id, // Use the user ID from Supabase Authentication
            email: data.user.email || "", // Ensure email is a string
            // name: data.user.user_metadata?.name || "Default Name", // Use name from user_metadata, default to "Default Name"
          },
        ]);

      if (insertError) {
        setError(insertError.message);
      } else {
        setUser(data.user); // Successfully inserted profile
        console.log("New user signed up and profile added:", data.user);
      }
    }

    setLoading(false);
  };


  return (
        <div
          style={{
            backgroundColor: "#FFF9DB", // Butter yellow background
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "2rem",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "black", }}>{ "Create an Account" }</h2>
            { (
              <p style={{ textAlign: "center", marginBottom: "1.5rem", color: "#555" }}>
                { "Fill in the form below to sign up and get started." }
              </p>
            )}
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="email" style={{ display: "block", marginBottom: ".5rem", color: "black", }}>
                  Email:
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "black",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="password" style={{ display: "block", marginBottom: ".5rem", color: "black", }}>
                  Password:
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "black",
                  }}
                />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="confirmpassword" style={{ display: "block", marginBottom: ".5rem", color: "black", }}>
                  Confirm Password:
                </label>
                <input
                  id="confirmpassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "black"
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
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
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
            {message && (
              <p
                style={{
                  marginTop: "1rem",
                  color: message.includes("successful") ? "green" : "red",
                  textAlign: "center",
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      );
}
