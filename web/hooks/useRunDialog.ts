import { useState } from "react"
import { toast } from "sonner"

interface UseRunDialogProps {
  promptId: string
  version: string
  onSuccess?: () => void
}

export function useRunDialog({
  promptId,
  version,
  onSuccess,
}: UseRunDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRun = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleRunSubmit = async (variables: Record<string, string>) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/prompts/${promptId}/runs`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     version,
      //     variables,
      //   }),
      // })

      // const data = await response.json()

      // if (!response.ok) {
      //   throw new Error(data.error || "Failed to run prompt")
      // }

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
