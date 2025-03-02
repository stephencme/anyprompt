"use client"

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import { Database } from "@/database.types"

// Import our new components
import PromptHeader from "./components/PromptHeader"
import PromptEditor from "./components/PromptEditor"
import RunHistory from "./components/RunHistory"
import NewVersionDialog from "./components/NewVersionDialog"

interface PromptClientProps {
  id: string
  prompt: Database["public"]["Tables"]["prompts"]["Row"]
  versions: Database["public"]["Tables"]["prompt_version"]["Row"][]
}

const PromptClient = ({ id, prompt, versions }: PromptClientProps) => {
  const [promptName, setPromptName] = useState<string>(prompt.name)
  const [version, setVersion] = useState<string>(versions[0].version as string)
  const [template, setTemplate] = useState<string>(versions[0].prompt as string)
  const [description, setDescription] = useState<string>(
    prompt.description || ""
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isCreatingVersion, setIsCreatingVersion] = useState<boolean>(false)
  const [errors, setErrors] = useState<{
    name?: string
    version?: string
    template?: string
    description?: string
    general?: string
  }>({})
  const [runHistory, setRunHistory] = useState<any[]>([])
  const [newVersionDialogOpen, setNewVersionDialogOpen] =
    useState<boolean>(false)

  // Extract template variables from the template
  const extractTemplateVariables = (templateText: string): string[] => {
    const regex = /{{([^{}]+)}}/g
    const matches = [...templateText.matchAll(regex)]
    const variables = matches.map((match) => match[1].trim())
    // Remove duplicates
    return [...new Set(variables)]
  }

  // Fetch run history
  useEffect(() => {
    const fetchRunHistory = async () => {
      try {
        const response = await fetch(`/api/prompts/${id}/runs`)
        if (response.ok) {
          const data = await response.json()
          setRunHistory(data)
        }
      } catch (error) {
        console.error("Error fetching run history:", error)
      }
    }

    fetchRunHistory()
  }, [id])

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!promptName || promptName.trim() === "") {
      newErrors.name = "Prompt name is required"
    }

    if (!version || !version.match(/^\d+\.\d+\.\d+$/)) {
      newErrors.version = "Version must be in format x.y.z (e.g. 0.0.1)"
    }

    if (!template || template.trim() === "") {
      newErrors.template = "Template is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Extract template variables
      const templateVariables = extractTemplateVariables(template)

      // Call API route to update prompt
      const response = await fetch(`/api/prompts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: promptName,
          template,
          description,
          version,
          templateVariables,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save prompt")
      }

      // Show success toast
      toast.success("Prompt saved successfully")
    } catch (error) {
      console.error("Error saving prompt:", error)
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to save prompt. Please try again.",
      })
      // Show error toast
      toast.error(
        error instanceof Error ? error.message : "Failed to save prompt"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleRun = async () => {
    // TODO: Implement run functionality
    console.log("Running prompt:", { name: promptName, version, template })
  }

  // Handle version change
  const handleVersionChange = (newVersion: string) => {
    // Find the selected version from versions array
    const selectedVersion = versions.find((v) => v.version === newVersion)

    if (selectedVersion) {
      setVersion(newVersion)
      setTemplate(selectedVersion.prompt as string)
    }
  }

  const handleCreateNewVersion = async (newVersion: string) => {
    setIsCreatingVersion(true)

    try {
      const response = await fetch(`/api/prompts/${id}/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: newVersion,
          prompt: template,
          templateVariables: extractTemplateVariables(template),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create new version")
      }

      toast.success(`Version ${newVersion} created successfully`)
      // Close the dialog and refresh to show the new version
      setNewVersionDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error creating new version:", error)
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to create new version. Please try again.",
      })
      toast.error(
        error instanceof Error ? error.message : "Failed to create new version"
      )
    } finally {
      setIsCreatingVersion(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PromptHeader
        id={id}
        promptName={promptName}
        version={version}
        template={template}
        description={description}
        isLoading={isLoading}
        onSave={handleSave}
        onNewVersion={() => setNewVersionDialogOpen(true)}
      />

      {errors.general && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 flex-grow">
        <div className="col-span-2 flex flex-col space-y-4">
          <PromptEditor
            promptName={promptName}
            description={description}
            template={template}
            errors={{
              description: errors.description,
              template: errors.template,
            }}
            onDescriptionChange={setDescription}
            onTemplateChange={setTemplate}
            version={version}
            versions={versions}
            onVersionChange={handleVersionChange}
          />
        </div>

        <div className="col-span-1">
          <RunHistory runHistory={runHistory} onRun={handleRun} />
        </div>
      </div>

      <NewVersionDialog
        isOpen={newVersionDialogOpen}
        onClose={() => setNewVersionDialogOpen(false)}
        onCreateVersion={handleCreateNewVersion}
        currentVersion={version}
        isLoading={isCreatingVersion}
      />
    </div>
  )
}

export default PromptClient
