"use client"

import React, { useState, useMemo, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
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

import { createClient } from "@supabase/supabase-js"

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// const providerModels = {
//   OpenAI: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
//   Anthropic: ["claude-3-haiku-20240307", "claude-3-5-sonnet"],
// }

const providers = ["OpenAI", "Anthropic"]

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
  const [model, setModel] = useState<string>("")
  const [provider, setProvider] = useState<string>("OpenAI")
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      const current_user = data?.user
      setUser(current_user)
    }
    fetchUser()
  }, [])

  // Fetch models when provider changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!user?.id) return // Don't fetch if no user

      setIsLoadingModels(true)
      try {
        console.log("Fetching models for user:", user.id)
        const response = await fetch(
          `/api/models?userId=${user.id}&provider=${provider}`
        )
        const data = await response.json()
        if (response.ok) {
          setAvailableModels(data.models)
          if (!model || !data.models.includes(model)) {
            setModel(data.models[0])
          }
        } else {
          console.error("Failed to fetch models:", data.error)
        }
      } catch (error) {
        console.error("Error fetching models:", error)
      } finally {
        setIsLoadingModels(false)
      }
    }

    fetchModels()
  }, [provider, user?.id])

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

    if (!user?.id) {
      setError("User not authenticated")
      return
    }

    await onRun({
      userID: user.id,
      promptID: promptVersion?.id || "",
      provider,
      model,
      parameters: variables,
    })
  }

  if (!promptVersion || !templateVariables) {
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
              disabled={isLoading || isLoadingModels}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 text-white" fill="white" />
              )}
              Generate output
            </button>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-fit gap-x-2 rounded-none">
                <SelectValue placeholder="Provider" className="font-dm-mono" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem
                    key={p}
                    value={p}
                    className="font-dm-mono text-sm"
                  >
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={model}
              onValueChange={setModel}
              disabled={isLoadingModels}
            >
              <SelectTrigger className="w-fit gap-x-2 rounded-none">
                <SelectValue placeholder="Model" className="font-dm-mono">
                  {isLoadingModels ? "Loading..." : model}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem
                    key={m}
                    value={m}
                    className="font-dm-mono text-sm"
                  >
                    {m}
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
