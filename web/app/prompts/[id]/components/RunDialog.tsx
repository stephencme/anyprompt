"use client"

import React, { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Merriweather } from "next/font/google"
import { Play } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { RunPromptRequest } from "@/hooks/useRunDialog"
import { Database } from "@/database.types"

const models = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", "claude-3-5-sonnet"]

interface RunDialogProps {
  isOpen: boolean
  onClose: () => void
  onRun: (request: RunPromptRequest) => Promise<void>
  promptVersion: Database["public"]["Tables"]["prompt_version"]["Row"] | null
  templateVariables?: string[]
  isLoading: boolean
}

const merriweather = Merriweather({
  weight: "700",
  subsets: ["latin"],
})

export default function RunDialog({
  isOpen,
  onClose,
  onRun,
  promptVersion,
  templateVariables = [],
  isLoading,
}: RunDialogProps) {
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [error, setError] = useState<string>("")
  const [model, setModel] = useState<string>("gpt-4o")

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all variables are filled
    const missingVariables = templateVariables.filter(
      (variable) => !variables[variable]
    )

    if (missingVariables.length > 0) {
      setError(`Please fill in all variables: ${missingVariables.join(", ")}`)
      return
    }

    await onRun({
      userID: "e0cbff44-6229-4098-925a-1e8ffc2bc888", // TODO: get user ID from session (currently hardcoded)
      promptID: promptVersion?.id || "",
      provider: "OpenAI", // 'OpenAI' or 'Anthropic'
      model,
      parameters: variables,
    })
  }

  if (!prompt || !templateVariables) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle
            className={`text-lg font-bold ${merriweather.className}`}
          >
            New Run
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Fill in the variables for this prompt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {templateVariables.map((variable) => (
            <div key={variable} className="flex flex-col">
              <label className="block mb-1 text-gray-500 font-dm-mono font-medium">
                {variable}
              </label>
              <input
                type="text"
                value={variables[variable] || ""}
                onChange={(e) =>
                  setVariables((prev) => ({
                    ...prev,
                    [variable]: e.target.value,
                  }))
                }
                className="w-full p-2 outline-none border-2 border-gray-200 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange bg-cream font-dm-mono"
                placeholder={`Enter ${variable}`}
              />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <div className="flex flex-col gap-y-2">
            <p className="text-gray-500 text-sm font-dm-mono">Input preview</p>
            <textarea
              className="w-full h-24 p-2 outline-none border-2 border-gray-200 bg-cream font-dm-mono"
              value={promptVersion?.prompt?.replace(
                /{{([^{}]+)}}/g,
                (match, p1) => variables[p1] || `{{${p1}}}`
              )}
              readOnly
            />
          </div>

          <div className="py-2 flex w-full justify-start gap-x-2">
            <button
              type="submit"
              className="bg-burnt-orange px-4 py-2 hover:bg-burnt-orange-dark text-white rounded-none flex items-center justify-center gap-2 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 text-white" fill="white" />
              )}
              Generate output
            </button>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-fit gap-x-2 rounded-none">
                <SelectValue placeholder="Model" className="font-dm-mono" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model, idx) => (
                  <SelectItem
                    key={`${model}-${idx}`}
                    value={model}
                    className="font-dm-mono text-sm"
                  >
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
