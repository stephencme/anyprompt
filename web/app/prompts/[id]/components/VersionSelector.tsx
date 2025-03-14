"use client"

import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Database } from "@/database.types"

interface VersionSelectorProps {
  version: string
  versions: Database["public"]["Tables"]["prompt_version"]["Row"][]
  onVersionChange: (version: string) => void
}

export default function VersionSelector({
  version,
  versions,
  onVersionChange,
}: VersionSelectorProps) {
  return (
    <div className="flex flex-col">
      <label className="block mb-1 text-gray-500 font-dm-mono font-medium">
        Version
      </label>
      <Select value={version} onValueChange={onVersionChange}>
        <SelectTrigger className="w-full bg-cream border-2 border-gray-200 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange rounded-none">
          <SelectValue placeholder="Select a version" />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {versions.map((v) => (
            <SelectItem key={v.id} value={v.version as string}>
              {v.version}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
