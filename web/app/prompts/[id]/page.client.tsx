"use client"

import React, { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Database } from "@/database.types"
import { extractTemplateVariables } from "@/lib/utils"

import PromptHeader from "./components/PromptHeader"
import PromptEditor from "./components/PromptEditor"
import RunHistory from "./components/RunHistory"
import NewVersionDialog from "./components/NewVersionDialog"
import { redirect } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRunDialogContext } from "@/context/RunDialogContext"
import RunDialog from "@/components/RunDialog"

interface PromptClientProps {
  id: string
}

const PromptClient = ({ id }: PromptClientProps) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [prompt, setPrompt] = useState<
    Database["public"]["Tables"]["prompts"]["Row"]
  >({} as Database["public"]["Tables"]["prompts"]["Row"])
  const [versions, setVersions] = useState<
    Database["public"]["Tables"]["prompt_version"]["Row"][]
  >([])
  const { user, isAuthLoading } = useAuth()

  // To do: allow users to edit prompt name
  const [promptName, setPromptName] = useState<string>("")
  const [version, setVersion] = useState<string>("")
  const [versionId, setVersionId] = useState<string>("")
  const [template, setTemplate] = useState<string>("")
  const [templateVariables, setTemplateVariables] = useState<string[]>([])
  const [description, setDescription] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isCreatingVersion, setIsCreatingVersion] = useState<boolean>(false)
  const [errors, setErrors] = useState<{
    name?: string
    version?: string
    template?: string
    description?: string
    general?: string
  }>({})
  const [runHistory, setRunHistory] = useState<
    Database["public"]["Tables"]["run_history"]["Row"][]
  >([])
  const [newVersionDialogOpen, setNewVersionDialogOpen] =
    useState<boolean>(false)

  const {
    setIsOpen,
    setTemplateVariables: setRunDialogTemplateVariables,
    setPromptVersion: setRunDialogPromptVersion,
  } = useRunDialogContext()

  const fetchRunHistory = useCallback(async () => {
    console.log("fetchRunHistory called with versionId:", versionId)
    try {
      if (!versionId) {
        console.log("No versionId available, skipping run history fetch")
        return
      }

      console.log("Fetching run history for version:", versionId)
      const response = await fetch(
        `/api/prompts/${id}/versions/${versionId}/runs`,
      )
      console.log("Run history API response status:", response.status)
      const data = await response.json()
      console.log("Run history response data:", data)

      if (!response.ok) {
        console.error("Error response from API:", data)
        throw new Error(data.error || "Failed to fetch run history")
      }

      console.log("Setting run history with data:", data)
      setRunHistory([...data])
    } catch (error) {
      console.error("Error fetching run history:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch run history",
      )
    }
  }, [id, versionId])

  useEffect(() => {
    const fetchPrompt = async () => {
      if (isAuthLoading) {
        return
      }

      if (!user) {
        redirect("/login")
      }

      // Fetch the prompt data with the validated id
      const { data: promptData, error: promptError } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", id)
        .single()

      const { data: versionData, error: versionsError } = await supabase
        .from("prompt_version")
        .select("*")
        .eq("prompt_id", id)
        .order("created_at", { ascending: false })

      if (promptError || !promptData) {
        console.error("Error fetching prompt:", promptError)
        return redirect("/prompts")
      }

      if (versionsError || !versionData) {
        console.error("Error fetching versions:", versionsError)
        return redirect("/prompts")
      }

      if (!promptData) {
        console.error("Prompt not found")
        return redirect("/prompts")
      }

      setPrompt(promptData)
      setPromptName(promptData.name)
      setVersions(versionData)
      setVersion(versionData[0].version as string)
      setVersionId(versionData[0].id)
      setTemplate(versionData[0].prompt as string)
      setTemplateVariables(versionData[0].template_variables as string[])
      setDescription(promptData.description || "")
      setLoading(false)

      // Fetch run history for the initial version
      if (versionData[0].id) {
        console.log("Initial version ID:", versionData[0].id)
        fetchRunHistory()
      }
    }

    fetchPrompt()
  }, [id, user, isAuthLoading, fetchRunHistory])

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
      const newTemplateVariables = extractTemplateVariables(template)
      setTemplateVariables(newTemplateVariables)
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
          templateVariables: newTemplateVariables,
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
        error instanceof Error ? error.message : "Failed to save prompt",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle version change
  const handleVersionChange = async (newVersion: string) => {
    try {
      // Find the selected version from versions array
      const selectedVersion = versions.find((v) => v.version === newVersion)

      if (selectedVersion) {
        console.log("Selected version ID:", selectedVersion.id)
        setVersion(newVersion)
        setVersionId(selectedVersion.id)
        setTemplate(selectedVersion.prompt as string)
        setTemplateVariables(selectedVersion.template_variables as string[])

        // Fetch run history for this version
        fetchRunHistory()
      }
    } catch (error) {
      console.error("Error fetching version details:", error)
      toast.error("Failed to fetch version details")
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
          templateVariables,
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
        error instanceof Error ? error.message : "Failed to create new version",
      )
    } finally {
      setIsCreatingVersion(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
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

      <div className="grid grid-cols-5 gap-4 flex-grow">
        <div className="col-span-3 flex flex-col space-y-4">
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

        <div className="col-span-2">
          <RunHistory
            runHistory={runHistory}
            onRun={() => {
              setRunDialogTemplateVariables(templateVariables)
              setRunDialogPromptVersion(
                versions.find((v) => v.version === version) || null,
              )
              setIsOpen(true)
            }}
          />
        </div>
      </div>

      <NewVersionDialog
        isOpen={newVersionDialogOpen}
        onClose={() => setNewVersionDialogOpen(false)}
        onCreateVersion={handleCreateNewVersion}
        currentVersion={version}
        isLoading={isCreatingVersion}
      />
      <RunDialog onRunComplete={fetchRunHistory} />
    </div>
  )
}
export default PromptClient
