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
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

const dmmono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
})

const librefranklin = Libre_Franklin({
  weight: ["400", "700"],
  subsets: ["latin"],
})


// Weight	Class
// 100	  font-thin
// 200	  font-extralight
// 300	  font-light
// 400	  font-normal
// 500	  font-medium
// 600	  font-semibold
// 700	  font-bold
// 800	  font-extrabold
// 900	  font-black

export default function PromptsPageClient({ prompts }: PromptsPageClientProps) {
  return (
    <div className={`min-h-screen bg-[#fdfaf3] pt-7 pl-[32px] pr-[32px] text-[#222]`}>
  <h1 className={`text-2xl font-black mb-2 ${merriweather.className}`}>Settings</h1>
  
  {/* Horizontal line */}
  <hr className="border-t border-[#e0e0e0] mt-7 mb-6" />

  {/* Username + Sign out */}
  <div className="mb-8 pl-3">
    <h2 className={`text-sm mb-2 font-medium text-[#484F5E] ${dmmono.className}`}>Username</h2>
    <p className={`mb-4 text-[#0B152D] font-medium ${dmmono.className}`}>temp@email.com</p>
    <button className={`bg-burnt-orange text-white font-bold px-4 py-2 ${librefranklin.className}`}>Sign out</button>
  </div>

  {/* Password box */}
  <div className="mb-6">
    <h2 className={`text-sm mb-2 pl-3 text-[#484F5E] font-medium ${dmmono.className}`}>Change password</h2>
    <div className="border border-[#e0e0e0] p-1 flex items-center gap-3 w-full max-w-md">
      <label className={`text-burnt-orange font-normal ${dmmono.className}`} htmlFor="password">
        <span className="pl-2 font-medium">Password:</span>
      </label>
      <input
        id="password"
        type="password"
        placeholder="password"
        className="flex-1 border-none outline-none bg-transparent text-[#6D717B]"
      />
      <button className={`bg-[#DC6A50] text-white px-3 py-1 border border-[#eab6a7] font-bold ${librefranklin.className}`}>
        Change
      </button>
    </div>
  </div>

  {/* API Keys */}
  <div>
    <h2 className={`text-sm mb-2 pl-3 text-[#484F5E] font-medium ${dmmono.className}`}>API keys</h2>

    <div className="border border-[#e0e0e0] px-3 py-2 mb-2 max-w-md">
      <span className={`text-burnt-orange font-medium ${dmmono.className}`}>ANTHROPIC_API_KEY:</span> <span className="text-[#6D717B] ml-1">placeholder</span>
    </div>

    <div className="border border-[#e0e0e0] px-3 py-2 max-w-md">
      <span className={`text-burnt-orange font-medium ${dmmono.className}`}>OPENAI_API_KEY:</span> <span className="text-[#6D717B] ml-1">placeholder</span>
    </div>
  </div>
</div>

  );
}
