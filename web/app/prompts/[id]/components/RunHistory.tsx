"use client"

import React, { useState, useEffect } from "react"
import { Play } from "lucide-react"
import { Database } from "@/database.types"

interface RunHistoryProps {
  runHistory: Database["public"]["Tables"]["run_history"]["Row"][]
  onRun: () => void
}

// interface RunMetadata {
//   content?: string
//   role?: string
//   [key: string]: any
// }

export default function RunHistory({ runHistory, onRun }: RunHistoryProps) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  // Set initial selected run and update when new runs are available
  useEffect(() => {
    if (runHistory.length > 0) {
      // Always select the first run (newest) since they're ordered by timestamp descending
      setSelectedRunId(runHistory[0].id)
    }
  }, [runHistory])

  const selectedRun = runHistory.find((run) => run.id === selectedRunId)
  // const metadata = selectedRun?.additional_metadata as RunMetadata | undefined

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="text-gray-500 font-dm-mono font-medium">
          Run history
        </div>
        <button
          onClick={() => onRun()}
          className="flex items-center gap-2 font-bold bg-burnt-orange text-white px-4 py-2 hover:bg-burnt-orange-dark transition-all duration-300"
        >
          <Play className="w-4 h-4 text-white" fill="white" />
          <p className="font-bold">Run</p>
        </button>
      </div>
      <div className="flex flex-col gap-2 border-2 border-dashed border-gray-200 p-4 flex-grow">
        <div className="flex flex-col gap-4">
          <select
            className="border-2 border-gray-200 p-1 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange outline-none font-dm-mono"
            value={selectedRunId || ""}
            onChange={(e) => setSelectedRunId(e.target.value)}
          >
            {runHistory.length > 0 ? (
              runHistory.map((run) => (
                <option key={run.id} value={run.id}>
                  {run.model} {new Date(run.run_timestamp).toLocaleString()}
                </option>
              ))
            ) : (
              <option className="text-gray-400">No runs to show</option>
            )}
          </select>

          {selectedRun ? (
            <div className="border-t pt-4">
              <div className="mb-4">
                <div className="border-l-4 border-orange-500 pl-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-600">User</h3>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedRun.user_prompt || "No input content"}
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-2">
                  <h3 className="text-sm font-medium text-gray-600">
                    Assistant
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedRun.run_result}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 p-4 flex-grow flex items-center justify-center text-gray-400">
              Run results will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
