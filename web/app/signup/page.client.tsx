"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Libre_Franklin, DM_Mono } from "next/font/google"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

// Apply the fonts
const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  weight: "400", // You can adjust the weight as needed
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400", // You can adjust the weight as needed
})

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [message, setMessage] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null)
  // const { setUser } = useAuth()
  // const [error, setError] = useState<string | null>(null);

  // Messages do not show up, but otherwise, signup works
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/email-confirmed",
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage(
        "Please check your email to complete the registration process.",
      )
    }

    // if (data?.user) {
    //   // Insert the user profile into your custom table `Users`
    //   const { error: insertError } = await supabase.from("Users").insert([
    //     {
    //       id: data.user.id, // Use the user ID from Supabase Authentication
    //       email: data.user.email || "", // Ensure email is a string
    //     },
    //   ])

    //   setUser(data.user)

    //   if (insertError) {
    //     setError(insertError.message)
    //   } else {
    //     console.log("New user signed up and profile added:", data.user)
    //   }
    // }

    setLoading(false)
  }

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
        <div className="mb-4 relative">
          <label
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-[#DC6A50] ${dmMono.className} text-[15px] leading-[19.53px]`}
          >
            Confirm Password:
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="password"
            className={`w-[432px] h-[44px] pl-[165px] pr-3 border border-[#E7E6DF] focus:border-2 focus:border-[#DC6A50] focus:outline-none bg-[#FFFDF3] text-[#6D717B] ${dmMono.className} text-[15px] leading-[19.53px]`}
          />
        </div>
        <div className="mb-4 text-sm text-gray-500">
          <p className="font-medium">
            Password must be at least 8 characters long
          </p>
        </div>
        {error && (
          <p className={`text-red-500 text-sm mb-2 ${libreFranklin.className}`}>
            {error}
          </p>
        )}
        {message && (
          <p
            className={`text-green-500 text-sm mb-2 ${libreFranklin.className}`}
          >
            {message}
          </p>
        )}
        <div className="flex justify-between items-center mt-3 font-['Libre_Franklin'] text-[13px] leading-[15.76px]">
          <p className={`text-[#6D717B] ${libreFranklin.className}`}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold">
              Sign in
            </Link>
          </p>
          <button
            onClick={handleSignup}
            className="bg-[#DC6A50] text-white py-2 px-4 font-bold hover:bg-[#b14f2e] w-[135px] h-[40px] px-[12px]"
          >
            Create Account
          </button>
        </div>
      </div>
      <div className="flex justify-center text-[#6D717B] text-[13px] leading-[15.76px] space-x-4">
        <Link
          href="https://github.com/stephencme/anyprompt"
          target="_blank"
          className="hover:underline"
        >
          GitHub
        </Link>
        <span>|</span>
        <Link href="#" target="_blank" className="hover:underline">
          Report an issue
        </Link>
        <span>|</span>
        <Link
          href="https://github.com/stephencme/anyprompt/blob/main/CONTRIBUTING.md"
          target="_blank"
          className="hover:underline"
        >
          Contribute
        </Link>
      </div>
    </div>
  )
}
