"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LoginTemplate } from "@anyprompt/core";
import { useRouter } from "next/navigation";
import { Database } from "@/database.types";
import Link from "next/link";
import Image from "next/image";
import { Libre_Franklin, DM_Mono } from "next/font/google";

// Apply the fonts
const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  weight: "400", // You can adjust the weight as needed
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400", // You can adjust the weight as needed
});

const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "https://qcuruxudpkctlyrvagyy.supabase.co",
  process.env.SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdXJ1eHVkcGtjdGx5cnZhZ3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MDQzNTcsImV4cCI6MjA1NDQ4MDM1N30.igQTnslj7wYbdy6BD8z3YZipLATdvQh1URO3-ewq1EI"
);

interface LoginPageClientProps {
  login: LoginTemplate[];
}

export default function LoginPageClient(props: LoginPageClientProps) {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); //for page redirection

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
    // Uncomment once signup page is done and merged
    // router.push("/signup");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // FRONTEND DO WORK HERE:
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFDF3] p-10">
      <div
      className="bg-white border border-[#E7E6DF] w-[480px] min-h-[256px] p-6 shadow-md overflow-hidden mb-4"
      style={{ borderWidth: "1px" }}
    >
        <div className="mb-4 text-left">
          <Image
            src="/Logo.svg"
            alt="AnyPrompt"
            width={160}
            height={40}
            priority
          />
        </div>
        <div className="mb-4 relative">
          <label
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-[#DC6A50] ${dmMono.className} text-[15px] leading-[19.53px]`}
          >
            Username:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className={`w-[432px] h-[44px] pl-24 pr-3 border border-[#E7E6DF] focus:border-2 focus:border-[#DC6A50] focus:outline-none bg-[#FFFDF3] text-[#6D717B] ${dmMono.className} text-[15px] leading-[19.53px]`}
          />
        </div>
        <div className="mb-4 relative">
          <label
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-[#DC6A50] ${dmMono.className} text-[15px] leading-[19.53px]`}
          >
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className={`w-[432px] h-[44px] pl-24 pr-3 border border-[#E7E6DF] focus:border-2 focus:border-[#DC6A50] focus:outline-none bg-[#FFFDF3] text-[#6D717B] ${dmMono.className} text-[15px] leading-[19.53px]`}
          />
        </div>
        {error && (
          <p className={`text-red-500 text-sm mb-2 ${libreFranklin.className}`}>
            {error}
          </p>
        )}
        <div className="flex justify-between items-center mt-3 font-['Libre_Franklin'] text-[13px] leading-[15.76px]">
          <p className={`text-[#6D717B] ${libreFranklin.className}`}>
            Don’t have an account?{" "}
            <Link href="/signup" className="font-semibold">
              Create one
            </Link>
          </p>
          <button
            onClick={handleLogin}
            className="bg-[#DC6A50] text-white py-2 px-4 font-bold hover:bg-[#b14f2e] w-[73px] h-[40px] px-[12px]"
          >
            Sign in
          </button>
        </div>
      </div>
      <div className="flex justify-center text-[#6D717B] text-[13px] leading-[15.76px] space-x-4">
      <Link href="#" target="_blank" className="hover:underline">
        GitHub
      </Link>
      <span>|</span>
      <Link href="#" target="_blank" className="hover:underline">
        Report an issue
      </Link>
      <span>|</span>
      <Link href="#" target="_blank" className="hover:underline">
        Contribute
      </Link>
    </div>
    </div>
  );
}
