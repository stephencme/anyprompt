"use client"

import { Merriweather } from "next/font/google"
import PromptCard from "@/components/PromptCard"
import { Plus } from "lucide-react"
import Link from "next/link"

type PromptWithVersions = {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  versions: string[]
}

interface PromptsPageClientProps {
  prompts: PromptWithVersions[]
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
        <Link
          href="/prompts/new"
          className="bg-burnt-orange text-white px-3 py-2 flex items-center gap-1 font-semibold"
        >
          <Plus /> New
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 px-8">
        {prompts.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 p-4 h-64">
            <p className="text-gray-500">Create your first prompt</p>
          </div>
        )}
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  )
}
