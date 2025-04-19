"use client"

import React, { useState, useEffect } from "react"
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
import { useRunDialogContext } from "@/context/RunDialogContext"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

// const providerModels = {
//   OpenAI: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
//   Anthropic: ["claude-3-haiku-20240307", "claude-3-5-sonnet"],
// }

const providers = ["OpenAI", "Anthropic"]

const merriweather = Merriweather({
  weight: "700",
  subsets: ["latin"],
})

const handleRun = async ({
  userID,
  promptID,
  provider,
  model,
  parameters,
  setError,
  setResult,
}: {
  setError: (error: string) => void
  setResult: (result: string) => void
  userID: string
  promptID: string
  provider: string
  model: string
  parameters: Record<string, string>
}) => {
  setError("")

  // Basic validation.
  if (!userID || !promptID || !provider || !model) {
    setError(
      "Please fill in all standalone fields (userID, promptID, provider, model).",
    )
    return
  }
  if (Object.keys(parameters).length === 0) {
    setError("Please provide at least one template parameter.")
    return
  }

  try {
    // Ensure that the API endpoint URL matches your API route.
    const response = await fetch("/api/run-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userID,
        promptID,
        provider,
        model,
        parameters, // Used for prompt template replacement.
      }),
    })

    // Read and parse the JSON response.
    const data = await response.json()
    if (!response.ok) {
      setError(data.error || "An error occurred.")
    } else {
      setResult(data.result)
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message || "An unexpected error occurred.")
    } else {
      setError("An unexpected error occurred.")
    }
  }
}

interface RunDialogProps {
  onRun?: () => void
  isLoading?: boolean
  onRunComplete?: () => void
}

export default function RunDialog({
  onRun,
  isLoading: externalLoading,
  onRunComplete,
}: RunDialogProps) {
  const { isOpen, setIsOpen, promptVersion, templateVariables } =
    useRunDialogContext()

  const [variables, setVariables] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<string>("")
  const [provider, setProvider] = useState<string>("OpenAI")
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [result, setResult] = useState<string>("")
  const { user } = useAuth()
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false)

  // Fetch models when dialog is opened and provider changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!isOpen || !user?.id) return // Don't fetch if dialog is closed or no user

      setIsLoadingModels(true)
      try {
        const response = await fetch(
          `/api/models?provider=${provider}&userId=${user.id}`,
        )
        const data = await response.json()

        if (!response.ok) {
          if (data.errorType === "missing_api_key") {
            toast.error(
              "Please add your API key in the settings page to access models",
            )
            setShowApiKeyAlert(true)
          } else {
            console.error("Error fetching models:", data.error)
            toast.error(
              data.error || "Failed to fetch models. Please try again.",
            )
          }
          setAvailableModels([])
          return
        }

        // Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setAvailableModels(data)
        } else if (data.models && Array.isArray(data.models)) {
          setAvailableModels(data.models)
        } else {
          console.error("Unexpected models response format:", data)
          setAvailableModels([])
          toast.error("Failed to fetch models. Invalid response format.")
        }
        setShowApiKeyAlert(false)
      } catch (error) {
        console.error("Error fetching models:", error)
        setAvailableModels([])
        toast.error("Failed to fetch models. Please try again.")
      } finally {
        setIsLoadingModels(false)
      }
    }

    fetchModels()
  }, [isOpen, provider, user?.id])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    // Validate all variables are filled
    const missingVariables = templateVariables.filter(
      (variable) => !variables[variable],
    )

    if (missingVariables.length > 0) {
      setError(`Please fill in all variables: ${missingVariables.join(", ")}`)
      return
    }

    if (!user?.id) {
      setError("User not authenticated")
      return
    }

    if (!model) {
      setError("Please select a model")
      return
    }

    try {
      await handleRun({
        userID: user.id,
        promptID: promptVersion?.id || "",
        provider,
        model,
        parameters: variables,
        setError,
        setResult,
      })
      // Show success toast and close dialog
      toast.success("Prompt run completed successfully!")
      setIsOpen(false)
      // Call the onRunComplete callback to trigger run history fetch
      onRunComplete?.()
    } catch (error) {
      console.error("Error running prompt:", error)
      toast.error("Failed to run prompt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!promptVersion || !templateVariables) {
    return null
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/10"
            onClick={() => setIsOpen(false)}
          />
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl relative">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-bold ${merriweather.className}`}>
                  New Run
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600">
                Fill in the variables for this prompt.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <p className="text-gray-500 text-sm font-dm-mono">
                    Input preview
                  </p>
                  <textarea
                    className="w-full h-24 p-2 outline-none border-2 border-gray-200 bg-cream font-dm-mono"
                    value={promptVersion?.prompt?.replace(
                      /{{([^{}]+)}}/g,
                      (match, p1) => variables[p1] || `{{${p1}}}`,
                    )}
                    readOnly
                  />
                </div>

                <div className="py-2 flex items-center gap-4">
                  <button
                    type="submit"
                    className="bg-burnt-orange px-4 py-2 hover:bg-burnt-orange-dark text-white rounded-none flex items-center justify-center gap-2 font-bold whitespace-nowrap"
                    disabled={isLoadingModels}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 text-white" fill="white" />
                    )}
                    Generate output
                  </button>
                  <div className="flex items-center gap-2 flex-1">
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger className="w-[120px] gap-x-2 rounded-none">
                        <SelectValue
                          placeholder="Provider"
                          className="font-dm-mono"
                        />
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
                      <SelectTrigger className="flex-1 gap-x-2 rounded-none">
                        <SelectValue
                          placeholder="Model"
                          className="font-dm-mono"
                        >
                          {isLoadingModels ? "Loading..." : model}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="w-[300px]">
                        {availableModels.map((m) => (
                          <SelectItem
                            key={m}
                            value={m}
                            className="font-dm-mono text-sm break-all"
                          >
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
