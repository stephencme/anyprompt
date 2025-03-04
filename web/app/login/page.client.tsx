"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LoginTemplate } from "@anyprompt/core";

import { Database } from "@/database.types"

const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
)

interface LoginPageClientProps {
  login: LoginTemplate[];
}

export default function LoginPageClient(props: LoginPageClientProps) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();
  }, []);

  const handleLogin = async () => {
    setError(null);

    // Log in the user with Supabase Authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }
  };

  const handleSignUp = async () => {
    // handlesingup is implemented in the feature/login branch, when merging,
    // replace this code with the one from feature/login



    // setError(null);
  
    // // Sign up the user with Supabase Authentication
    // const { data, error } = await supabase.auth.signUp({
    //   email,
    //   password,
    // });
  
    // if (error) {
    //   setError(error.message);
    //   return;
    // }
  
    // if (data?.user) {
    //   // Insert the user profile into your custom table `Users`
    //   const { error: insertError } = await supabase
    //     .from("Users")
    //     .insert([
    //       {
    //         id: data.user.id, // Use the user ID from Supabase Authentication
    //         email: data.user.email || "", // Ensure email is a string
    //         name: data.user.user_metadata?.name || "Default Name", // Use name from user_metadata, default to "Default Name"
    //       },
    //     ]);
  
    //   if (insertError) {
    //     setError(insertError.message);
    //   } else {
    //     setUser(data.user); // Successfully inserted profile
    //     console.log("New user signed up and profile added:", data.user);
    //   }
    // }
  };
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // FRONTEND DO WORK HERE:
  return (
    <div className="bg-gray-50 p-8">
      <div className="mb-4">
        {user ? (
          <div>
            <p>Welcome, {user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {user && (
        <table className="bg-white table-auto w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
            </tr>
          </thead>
          <tbody>
            {props.login.map((login) => (
              <tr className="border-b border-gray-300" key={login.id}>
                <td className="font-mono px-4 py-2 text-left">{login.id}</td>
                <td className="font-mono px-4 py-2 text-left">{login.name}</td>
                <td className="font-mono px-4 py-2 text-left">
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
