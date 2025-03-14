"use client"

import React from "react"
import { Play } from "lucide-react"

interface RunHistoryProps {
  runHistory: any[]
  onRun: () => void
}

export default function RunHistory({ runHistory, onRun }: RunHistoryProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-2 text-gray-500 font-dm-mono font-medium">
        Run history
      </div>
      <div className="flex flex-col gap-2 border-2 border-dashed border-gray-200 p-4 flex-grow">
        <div className="flex justify-between items-center">
          <select className="border-2 border-gray-200 p-1 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange outline-none font-dm-mono">
            {runHistory.length > 0 ? (
              runHistory.map((run) => (
                <option key={run.id} value={run.id}>
                  {run.model} {new Date(run.created_at).toLocaleString()}
                </option>
              ))
            ) : (
              <option className="text-gray-400">No runs to show</option>
            )}
          </select>
          <button
            onClick={onRun}
            className="flex items-center gap-2 font-bold bg-burnt-orange text-white px-4 py-2 hover:bg-burnt-orange-dark transition-all duration-300"
          >
            <Play className="w-4 h-4 text-white" fill="white" />
            <p className="font-bold">Run</p>
          </button>
        </div>

        {runHistory.length > 0 ? (
          <div className="mt-4 border-t pt-4">
            <div className="mb-4">
              <div className="border-l-4 border-orange-500 pl-2 mb-2">
                <h3 className="text-sm font-medium text-gray-600">User</h3>
                <p className="text-sm">Summarize the following email...</p>
                <p className="text-sm">EMAIL:</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-2">
                <h3 className="text-sm font-medium text-gray-600">Assistant</h3>
                <p className="text-sm">
                  Sure! Please provide the content of the email you&apos;d like
                  me to summarize.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 p-4 flex-grow mt-2 flex items-center justify-center text-gray-400">
            Run results will appear here
          </div>
        )}
      </div>
    </div>
  )
}
