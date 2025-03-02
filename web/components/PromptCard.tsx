"use client"

import React, { useState } from "react"
import { DM_Mono } from "next/font/google"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play } from "lucide-react"
import Link from "next/link"

type PromptCardProps = {
  prompt: {
    id: string
    name: string
    description: string
    versions: string[]
  }
}

const DMMono = DM_Mono({
  weight: "400",
  subsets: ["latin"],
})

const DMMonoBold = DM_Mono({
  weight: "500",
  subsets: ["latin"],
})

const PromptCard = ({ prompt }: PromptCardProps) => {
  const [version, setVersion] = useState("0.0.1")

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className={`${DMMonoBold.className} text-lg text-navy`}>
          {prompt.name}
        </p>
        <Select value={version} onValueChange={setVersion}>
          <SelectTrigger className="w-fit gap-x-2 rounded-none">
            <SelectValue
              placeholder="Version"
              className={`${DMMono.className}`}
            />
          </SelectTrigger>
          <SelectContent>
            {prompt.versions.map((version) => (
              <SelectItem
                key={version}
                value={version}
                className={`${DMMono.className} text-sm`}
              >
                {version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={`${DMMono.className} bg-cream p-4 text-sm text-gray-500`}>
        {prompt.description}
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 font-bold bg-burnt-orange text-white px-4 py-2 hover:bg-burnt-orange-dark transition-all duration-300">
          <Play className="w-4 h-4 text-white" fill="white" />
          <p className={`${DMMono.className} font-bold`}>Run</p>
        </button>
        <Link
          href={`/prompts/${prompt.id}`}
          className="flex items-center font-bold gap-2 border px-4 py-2 hover:bg-[#F5F5F5] transition-all duration-300"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}

export default PromptCard
