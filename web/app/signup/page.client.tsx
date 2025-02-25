"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SignupTemplate } from "@anyprompt/core";

import { Database } from "@/database.types"

const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
)

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);


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
        data: { name }, // Store name in user_metadata
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
            name: data.user.user_metadata?.name || "Default Name", // Use name from user_metadata, default to "Default Name"
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


  // FRONTEND DO WORK HERE
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl text-black font-bold black">Sign Up</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-3 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      {message && <p className="mt-3 text-red-500">{message}</p>}
    </div>
  );
}
