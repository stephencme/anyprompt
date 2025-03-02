"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LoginTemplate } from "@anyprompt/core";
import { useRouter } from "next/navigation";
import { Database } from "@/database.types"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
)

interface LoginPageClientProps {
  login: LoginTemplate[];
}

export default function LoginPageClient(props: LoginPageClientProps) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();
  }, []);

  const handleLogin = async () => {
    setError(null);

    // Log in the user with Supabase Authentication and set session to the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    //after login, redirect user to the prompt page
    router.push("/prompt")
  };

  const handleSignUp = async () => {
    router.push("/signup"); // Redirect to signup after confirmation
  };
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // FRONTEND DO WORK HERE:
  return (
    <div className="bg-gray-50 p-8">
      <div className="mb-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              style={{ color: "black" }}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border rounded mb-2 w-full"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              style={{ color: "black" }}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border rounded mb-2 w-full"
            />
            <button
              onClick={handleLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2"
            >
              Login
            </button>
            <button
              onClick={handleSignUp}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Sign Up
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </div>
      </div>
    </div>
  );
}
