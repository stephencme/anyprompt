"use client"

import React, { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NewVersionDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateVersion: (version: string) => Promise<void>
  currentVersion: string
  isLoading: boolean
}

export default function NewVersionDialog({
  isOpen,
  onClose,
  onCreateVersion,
  currentVersion,
  isLoading,
}: NewVersionDialogProps) {
  // Generate a suggested new version based on current version
  const generateSuggestedVersion = () => {
    const versionParts = currentVersion.split(".").map(Number)
    versionParts[2] += 1 // Increment the patch version
    return versionParts.join(".")
  }

  const [newVersion, setNewVersion] = useState<string>(
    generateSuggestedVersion()
  )
  const [error, setError] = useState<string>("")

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate version format
    if (!newVersion || !newVersion.match(/^\d+\.\d+\.\d+$/)) {
      setError("Version must be in format x.y.z (e.g. 0.0.1)")
      return
    }

    await onCreateVersion(newVersion)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Create New Version
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter a version number for the new prompt version.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex flex-col">
            <label className="block mb-1 text-gray-500 font-dm-mono font-medium">
              Version Number
            </label>
            <input
              type="text"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              className="w-full p-2 outline-none border-2 border-gray-200 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange bg-cream font-dm-mono"
              placeholder="e.g. 0.0.2"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <DialogFooter className="pt-4 flex justify-end gap-x-2">
            <button
              type="button"
              onClick={onClose}
              className="border-gray-300 bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-none border"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-burnt-orange px-4 py-2 hover:bg-burnt-orange-dark text-white rounded-none flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Version
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
