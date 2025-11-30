"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Clock, ChevronDown, ExternalLink, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  html_url: string
  head_sha: string
  head_branch: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusIcon(status: string, conclusion: string | null) {
  if (status === "completed") {
    if (conclusion === "success") {
      return <CheckCircle className="w-5 h-5 text-success" />
    }
    return <XCircle className="w-5 h-5 text-destructive" />
  }
  return <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
}

function getStatusText(status: string, conclusion: string | null): string {
  if (status === "completed") {
    return conclusion || "completed"
  }
  return status
}

function groupByDate(runs: WorkflowRun[]): Record<string, WorkflowRun[]> {
  const groups: Record<string, WorkflowRun[]> = {}

  for (const run of runs) {
    const date = new Date(run.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(run)
  }

  return groups
}

export function WorkflowsContent({ initialRuns }: { initialRuns: WorkflowRun[] }) {
  const [expandedRun, setExpandedRun] = useState<number | null>(null)
  const grouped = groupByDate(initialRuns)

  const stats = {
    total: initialRuns.length,
    success: initialRuns.filter((r) => r.conclusion === "success").length,
    failed: initialRuns.filter((r) => r.conclusion === "failure").length,
    pending: initialRuns.filter((r) => r.status !== "completed").length,
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workflow Runs</h1>
        <p className="text-muted-foreground">CI/CD workflow results and test status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 border border-border rounded-xl">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Runs</div>
        </div>
        <div className="p-4 border border-border rounded-xl">
          <div className="text-2xl font-bold text-success">{stats.success}</div>
          <div className="text-sm text-muted-foreground">Successful</div>
        </div>
        <div className="p-4 border border-border rounded-xl">
          <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
          <div className="text-sm text-muted-foreground">Failed</div>
        </div>
        <div className="p-4 border border-border rounded-xl">
          <div className="text-2xl font-bold">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
      </div>

      {/* Workflow List */}
      {initialRuns.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No workflow runs found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, runs]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-border" />
                {date}
              </h2>
              <div className="space-y-2">
                {runs.map((run) => (
                  <div key={run.id} className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                    >
                      {getStatusIcon(run.status, run.conclusion)}
                      <div className="flex-1 text-left">
                        <div className="font-medium">{run.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {run.head_branch} · {run.head_sha.slice(0, 7)}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          run.conclusion === "success" && "bg-success/10 text-success",
                          run.conclusion === "failure" && "bg-destructive/10 text-destructive",
                          !run.conclusion && "bg-muted text-muted-foreground",
                        )}
                      >
                        {getStatusText(run.status, run.conclusion)}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          expandedRun === run.id && "rotate-180",
                        )}
                      />
                    </button>

                    {expandedRun === run.id && (
                      <div className="border-t border-border p-4 bg-muted/30">
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <span className="ml-2">{formatDate(run.created_at)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Updated:</span>
                            <span className="ml-2">{formatDate(run.updated_at)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Branch:</span>
                            <span className="ml-2 font-mono">{run.head_branch}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Commit:</span>
                            <span className="ml-2 font-mono">{run.head_sha.slice(0, 7)}</span>
                          </div>
                        </div>
                        <a
                          href={run.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm hover:underline"
                        >
                          View on GitHub
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
