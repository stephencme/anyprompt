"use client"

import { Merriweather } from "next/font/google"
import { PromptTemplate } from "@anyprompt/core"
import PromptCard from "@/components/PromptCard"
import { Plus } from "lucide-react"

interface PromptsPageClientProps {
  prompts: PromptTemplate[]
}

const merriweather = Merriweather({
  weight: "400",
  subsets: ["latin"],
})

export default function PromptsPageClient({ prompts }: PromptsPageClientProps) {
  return (
    <div className="bg-cream min-h-screen w-full">
      <div className="flex items-center justify-between px-8 py-6">
        <div className={`${merriweather.className} flex items-center gap-2`}>
          <p className={`text-xl font-bold`}>Prompts</p>
          <p className={`text-xl font-bold`}>·</p>
          <p className={`text-xl`}>{prompts.length}</p>
        </div>
        <button className="bg-burnt-orange text-white px-3 py-2 flex items-center gap-1 font-semibold">
          <Plus /> New
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 px-8">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  )
}
