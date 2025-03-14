"use client"

import { merriweather } from "@/app/fonts"
import Link from "next/link"
import { X, Loader2 } from "lucide-react"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PromptHeaderProps {
  id: string
  promptName: string
  version: string
  template: string
  description: string
  isLoading: boolean
  onSave: () => Promise<void>
  onNewVersion: () => void
}

export default function PromptHeader({
  id,
  promptName,
  version,
  template,
  description,
  isLoading,
  onSave,
  onNewVersion,
}: PromptHeaderProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false)
  const [isDuplicating, setIsDuplicating] = React.useState<boolean>(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Prompt deleted successfully")
        router.push("/prompts")
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete prompt")
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to delete prompt"
      )
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${promptName} (Copy)`,
          template,
          description,
          version,
          templateVariables: extractTemplateVariables(template),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to duplicate prompt")
      }

      toast.success("Prompt duplicated successfully")
      // Navigate to the new prompt
      router.push(`/prompts/${data.id}`)
    } catch (error) {
      console.error("Error duplicating prompt:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to duplicate prompt"
      )
    } finally {
      setIsDuplicating(false)
    }
  }

  // Helper function to extract template variables
  const extractTemplateVariables = (templateText: string): string[] => {
    const regex = /{{([^{}]+)}}/g
    const matches = [...templateText.matchAll(regex)]
    const variables = matches.map((match) => match[1].trim())
    return [...new Set(variables)]
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex gap-2 text-2xl font-bold">
        <p className={`${merriweather.className}`}>Prompts</p>
        <p className="font-mono">/</p>
        <p className="font-mono font-normal">
          {promptName}@{version}
        </p>
      </div>
      <div className="flex gap-2 items-center">
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <button className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 transition-all duration-300">
              Delete
            </button>
          </DialogTrigger>
          <DialogContent className="p-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium">
                Delete Prompt
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                This action cannot be undone. This will permanently delete the
                prompt and all its versions.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="p-4 flex justify-end gap-x-2">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="border-gray-300 bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-none border"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 px-4 py-2 hover:bg-red-700 text-white rounded-none flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <button
          onClick={handleDuplicate}
          className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
          disabled={isDuplicating}
        >
          {isDuplicating && <Loader2 className="h-4 w-4 animate-spin" />}
          Duplicate
        </button>
        <button
          onClick={onNewVersion}
          className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
        >
          New Version
        </button>
        <button
          onClick={onSave}
          disabled={isLoading}
          className={`flex items-center gap-2 justify-center font-bold ${
            isLoading
              ? "bg-gray-400"
              : "bg-burnt-orange hover:bg-burnt-orange-dark"
          } text-white px-4 py-2 transition-all duration-300`}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <p className="font-bold">{isLoading ? "Saving..." : "Save"}</p>
        </button>
        <Link href="/prompts" className="px-2">
          <X />
        </Link>
      </div>
    </div>
  )
}
