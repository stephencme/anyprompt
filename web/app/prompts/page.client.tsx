"use client"

import { Merriweather } from "next/font/google"
import PromptCard from "@/components/PromptCard"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Database } from "@/database.types"

type PromptWithVersions = Database["public"]["Tables"]["prompts"]["Row"] & {
  versions: Database["public"]["Tables"]["prompt_version"]["Row"][]
}

const merriweather = Merriweather({
  weight: "400",
  subsets: ["latin"],
})

export default function PromptsPageClient() {
  const [promptsWithVersions, setPromptsWithVersions] = useState<
    PromptWithVersions[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthLoading } = useAuth()

  async function getPromptsWithVersions() {
    if(user){
      setIsLoading(true)
      try{
        const response = await fetch(`/api/prompts?userId=${user.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch prompts")
        } 
        const prompts = await response.json()
        setIsLoading(false);
        return prompts;
    }
    catch(error){
      console.error("Error fetching prompts:", error)
      toast.error("Failed to fetch prompts")
    }
  }

    // const res = await fetch(`http://localhost:3000/api/prompts`, {
    //   cache: "no-store",
    // })

    // if (!res.ok) {
    //   throw new Error("Failed to fetch prompts")
    // }

    // const prompts = await res.json()
    // setIsLoading(false)
    // return prompts
  }

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!user) {
      redirect("/login")
    }

    getPromptsWithVersions().then((prompts) => {
      setPromptsWithVersions(prompts)
    })
  }, [user, isAuthLoading])

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen w-full">
      <div className="flex items-center justify-between px-8 py-6">
        <div className={`${merriweather.className} flex items-center gap-2`}>
          <p className={`text-xl font-bold`}>Prompts</p>
          <p className={`text-xl font-bold`}>·</p>
          <p className={`text-xl`}>{promptsWithVersions.length}</p>
        </div>
        <Link
          href="/prompts/new"
          className="bg-burnt-orange text-white px-3 py-2 flex items-center gap-1 font-semibold"
        >
          <Plus /> New
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 px-8">
        {promptsWithVersions.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 p-4 h-64">
            <p className="text-gray-500">Create your first prompt</p>
          </div>
        )}
        {promptsWithVersions.map((promptWithVersions) => (
          <PromptCard
            key={promptWithVersions.id}
            promptWithVersions={promptWithVersions}
          />
        ))}
      </div>
    </div>
  )
}
