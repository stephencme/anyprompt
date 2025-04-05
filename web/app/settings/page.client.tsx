"use client"

import { Merriweather } from "next/font/google"
import { Libre_Franklin } from "next/font/google"
import { DM_Mono } from "next/font/google"
import PromptCard from "@/components/PromptCard"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PromptVersion } from "@/types/prompts"

type PromptWithVersions = {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  versions: PromptVersion[]
}
interface PromptsPageClientProps {
  prompts: PromptWithVersions[]
}

const merriweather = Merriweather({
  weight: "400",
  subsets: ["latin"],
})

const dmmono = DM_Mono({
  weight: "400",
  subsets: ["latin"],
})

const librefranklin = Libre_Franklin({
  weight: "400",
  subsets: ["latin"],
})

export default function PromptsPageClient({ prompts }: PromptsPageClientProps) {
  return (
    <div className={`min-h-screen bg-[#fdfaf3] pt-24 pl-[32] text-[#222]`}>
      <h1 className={`text-2xl font-bold mb-6 ${merriweather.className}`}>Settings</h1>


      <div className="mb-8">
        <h2 className="text-sm mb-2 text-[#484F5E]">Username</h2>
        <p className={`mb-4 text-[#0B152D] font-bold ${dmmono.className}`}>PLACEHOLDER@email.com</p>
        <button className={`bg-burnt-orange text-white px-4 py-2 ${librefranklin.className}`}>Sign out</button>
      </div>

      <div className="mb-8">
        <h2 className="text-sm mb-2">Change password</h2>
        <div className="flex items-center gap-2">
          <label className="text-burnt-orange font-bold" htmlFor="password">
            Password:
          </label>
          <input
            id="password"
            type="password"
            placeholder="password"
            className="border border-gray-300 px-2 py-1"
          />
          <button className="bg-burnt-orange text-white px-3 py-1 border border-[#eab6a7]">
            Change
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-sm mb-2">API keys</h2>
        <div className="border border-gray-300 p-2 mb-2 bg-white">
          <span className="text-burnt-orange font-bold">ANTHROPIC_API_KEY:</span> PLACEHOLDER KEY
        </div>
        <div className="border border-gray-300 p-2 bg-white">
          <span className="text-burnt-orange font-bold">OPENAI_API_KEY:</span> PLACEHOLDER KEY
        </div>
      </div>
    </div>
  );
}
