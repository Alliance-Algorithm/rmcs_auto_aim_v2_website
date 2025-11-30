"use client"

import { useMemo } from "react"
import { Download, ImageIcon, Video, File, Music, FileCode } from "lucide-react"

interface ResourceGroup {
  label: string
  icon: typeof File
  extensions: string[]
  items: { name: string; url: string; ext: string }[]
}

function getExtension(filename: string): string {
  const parts = filename.split(".")
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : ""
}

function categorizeAssets(assets: Record<string, string>): ResourceGroup[] {
  const categories: Record<string, ResourceGroup> = {
    images: {
      label: "Images",
      icon: ImageIcon,
      extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"],
      items: [],
    },
    videos: {
      label: "Videos",
      icon: Video,
      extensions: ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv"],
      items: [],
    },
    audio: {
      label: "Audio",
      icon: Music,
      extensions: ["mp3", "wav", "ogg", "flac", "aac", "m4a"],
      items: [],
    },
    code: {
      label: "Code & Data",
      icon: FileCode,
      extensions: ["json", "yaml", "yml", "xml", "csv", "txt", "md"],
      items: [],
    },
    other: {
      label: "Other Files",
      icon: File,
      extensions: [],
      items: [],
    },
  }

  for (const [name, url] of Object.entries(assets)) {
    const ext = getExtension(name)
    let categorized = false

    for (const [key, category] of Object.entries(categories)) {
      if (key === "other") continue
      if (category.extensions.includes(ext)) {
        category.items.push({ name, url, ext })
        categorized = true
        break
      }
    }

    if (!categorized) {
      categories.other.items.push({ name, url, ext })
    }
  }

  return Object.values(categories).filter((cat) => cat.items.length > 0)
}

export function ResourcesContent({ assets }: { assets: Record<string, string> }) {
  const groups = useMemo(() => categorizeAssets(assets), [assets])
  const totalAssets = Object.keys(assets).length

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      window.open(url, "_blank")
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Resources</h1>
        <p className="text-muted-foreground">Images, videos, and other assets for testing and development</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-8 p-4 border border-border rounded-xl">
        <div>
          <div className="text-2xl font-bold">{totalAssets}</div>
          <div className="text-sm text-muted-foreground">Total Assets</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex gap-4">
          {groups.map((group) => (
            <div key={group.label} className="text-sm">
              <span className="text-muted-foreground">{group.label}:</span>
              <span className="ml-1 font-medium">{group.items.length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Groups */}
      {totalAssets === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No assets found in test/asset.yml</p>
          <p className="text-sm mt-2">Add resources in the format: filename: URL</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const Icon = group.icon
            return (
              <div key={group.label}>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Icon className="w-5 h-5" />
                  {group.label}
                  <span className="text-sm font-normal text-muted-foreground">({group.items.length})</span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 p-4 border border-border rounded-xl group hover:bg-accent/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <span className="text-xs font-mono uppercase text-muted-foreground">{item.ext || "?"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(item.url, item.name)}
                        className="p-2 rounded-lg hover:bg-accent opacity-0 group-hover:opacity-100 transition-all"
                        aria-label={`Download ${item.name}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info */}
      <div className="mt-12 p-4 border border-border rounded-xl bg-muted/30">
        <h3 className="font-medium mb-2">About Test Resources</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Resources are loaded from the{" "}
          <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">test/asset.yml</code> file in the
          repository. Each entry follows the format{" "}
          <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">filename: URL</code>. Click the download
          button to save any resource locally.
        </p>
      </div>
    </main>
  )
}
