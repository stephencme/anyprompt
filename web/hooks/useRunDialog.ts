import { useState } from "react"
import { toast } from "sonner"

interface UseRunDialogProps {
  promptId: string
  version: string
  onSuccess?: () => void
}

export interface RunPromptRequest {
  userID: string
  promptID: string
  provider: string
  model: string
  parameters: Record<string, string>
}

export function useRunDialog({ onSuccess }: UseRunDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRun = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleRunSubmit = async ({
    userID,
    promptID,
    provider,
    model,
    parameters,
  }: RunPromptRequest) => {
    setIsLoading(true)
    try {
      console.log("Running prompt:", {
        userID,
        promptID,
        provider,
        model,
        parameters,
      })

      // TODO: Replace with actual API call
      const response = await fetch(`/api/run-prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID,
          promptID,
          provider,
          model,
          parameters, // template variables
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to run prompt")
      }

      // Close the dialog
      setIsOpen(false)

      // Show success toast
      toast.success("Prompt run successfully")

      // Call onSuccess callback if provided
      onSuccess?.()
    } catch (error) {
      console.error("Error running prompt:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to run prompt"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isOpen,
    isLoading,
    handleRun,
    handleClose,
    handleRunSubmit,
  }
}
