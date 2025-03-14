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
import { useRunDialog } from "@/hooks/useRunDialog"
import RunDialog from "@/app/prompts/[id]/components/RunDialog"
import { PromptVersion } from "@/types/prompts"

type PromptCardProps = {
  prompt: {
    id: string
    name: string
    description: string
    versions: PromptVersion[]
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
  const [version, setVersion] = useState(prompt.versions[0].version)
  const { isOpen, isLoading, handleRun, handleClose, handleRunSubmit } =
    useRunDialog({
      promptId: prompt.id,
      version,
    })

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
            {prompt.versions.map((version, idx) => (
              <SelectItem
                key={`${version.version}-${idx}`}
                value={version.version}
                className={`${DMMono.className} text-sm`}
              >
                {version.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={`${DMMono.className} bg-cream p-4 text-sm text-gray-500`}>
        {prompt.description}
      </div>
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-2 font-bold bg-burnt-orange text-white px-4 py-2 hover:bg-burnt-orange-dark transition-all duration-300"
          onClick={handleRun}
        >
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

      <RunDialog
        isOpen={isOpen}
        onClose={handleClose}
        onRun={handleRunSubmit}
        prompt={
          prompt.versions.find((v) => v.version === version)?.prompt || ""
        }
        templateVariables={
          prompt.versions.find((v) => v.version === version)
            ?.template_variables || []
        }
        isLoading={isLoading}
      />
    </div>
  )
}

export default PromptCard
