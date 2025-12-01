"use client"

import { useMemo } from "react"
import { Download, ImageIcon, Video, File, Music, FileCode, FileText, Archive, Container } from "lucide-react"

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

function getFilenameFromUrl(url: string): string {
  try {
    // 移除查询参数和锚点
    const urlWithoutQuery = url.split("?")[0].split("#")[0]
    // 获取路径的最后一部分
    const pathParts = urlWithoutQuery.split("/")
    return pathParts[pathParts.length - 1] || ""
  } catch {
    return ""
  }
}

function getFileType(filename: string, url: string): { icon: typeof File; category: string } {
  const lowerName = filename.toLowerCase()

  // 从 URL 中提取文件名和扩展名
  const urlFilename = getFilenameFromUrl(url)
  const urlExt = getExtension(urlFilename)
  const urlLowerName = urlFilename.toLowerCase()

  // 优先使用 URL 中的扩展名，如果没有则使用文件名中的扩展名
  const ext = urlExt || getExtension(filename)

  // 推理模型（以 model.zip 结尾）
  if (
    lowerName.endsWith("model.zip") ||
    urlLowerName.endsWith("model.zip") ||
    (ext === "zip" && (lowerName.includes("model") || urlLowerName.includes("model")))
  ) {
    return { icon: Archive, category: "models" }
  }

  // 图片
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) {
    return { icon: ImageIcon, category: "images" }
  }

  // 视频
  if (["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv"].includes(ext)) {
    return { icon: Video, category: "videos" }
  }

  // 音频
  if (["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext)) {
    return { icon: Music, category: "audio" }
  }

  // yml/yaml
  if (["yml", "yaml"].includes(ext)) {
    return { icon: FileCode, category: "code" }
  }

  // json
  if (ext === "json") {
    return { icon: FileCode, category: "code" }
  }

  // .clangd-format
  if (
    lowerName === ".clangd-format" ||
    lowerName.endsWith(".clangd-format") ||
    urlLowerName === ".clangd-format" ||
    urlLowerName.endsWith(".clangd-format")
  ) {
    return { icon: FileCode, category: "code" }
  }

  // txt
  if (ext === "txt") {
    return { icon: FileText, category: "code" }
  }

  // Dockerfile
  if (
    lowerName === "dockerfile" ||
    lowerName.startsWith("dockerfile.") ||
    urlLowerName === "dockerfile" ||
    urlLowerName.startsWith("dockerfile.")
  ) {
    return { icon: Container, category: "code" }
  }

  // zip/archive
  if (ext === "zip" || ext === "tar" || ext === "gz" || ext === "rar" || ext === "7z") {
    return { icon: Archive, category: "archives" }
  }

  // 其他代码文件
  if (["xml", "csv", "md", "js", "ts", "py", "java", "cpp", "c", "h", "hpp"].includes(ext)) {
    return { icon: FileCode, category: "code" }
  }

  return { icon: File, category: "other" }
}

function getFileIcon(filename: string, url: string) {
  return getFileType(filename, url).icon
}

function categorizeAssets(assets: Record<string, string>): ResourceGroup[] {
  const categories: Record<string, ResourceGroup> = {
    images: {
      label: "Images",
      icon: ImageIcon,
      extensions: [],
      items: [],
    },
    videos: {
      label: "Videos",
      icon: Video,
      extensions: [],
      items: [],
    },
    audio: {
      label: "Audio",
      icon: Music,
      extensions: [],
      items: [],
    },
    models: {
      label: "Models",
      icon: Archive,
      extensions: [],
      items: [],
    },
    archives: {
      label: "Archives",
      icon: Archive,
      extensions: [],
      items: [],
    },
    code: {
      label: "Code & Data",
      icon: FileCode,
      extensions: [],
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
    const { category } = getFileType(name, url)

    if (categories[category]) {
      categories[category].items.push({ name, url, ext })
    } else {
      categories.other.items.push({ name, url, ext })
    }
  }

  return Object.values(categories).filter((cat) => cat.items.length > 0)
}

export function ResourcesContent({ assets }: { assets: Record<string, string> }) {
  const groups = useMemo(() => categorizeAssets(assets), [assets])
  const totalAssets = Object.keys(assets).length

  const handleDownload = (url: string, filename: string) => {
    // 直接使用浏览器下载接口，不通过 next 路由
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
                  {group.items.map((item) => {
                    const Icon = getFileIcon(item.name, item.url)
                    return (
                      <div
                        key={item.name}
                        onClick={() => handleDownload(item.url, item.name)}
                        className="flex items-center gap-3 p-4 border border-border rounded-xl group hover:bg-accent/30 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground break-all" title={item.url}>
                            {item.url}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                          <Download className="w-4 h-4" />
                        </div>
                      </div>
                    )
                  })}
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
