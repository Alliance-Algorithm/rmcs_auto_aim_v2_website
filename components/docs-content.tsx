"use client"

import { useState, useEffect } from "react"
import { ChevronRight, FileText, Folder, ChevronDown } from "lucide-react"
import { fetchDocFiles, fetchFileContent } from "@/lib/github"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { cn } from "@/lib/utils"

interface DocFile {
  name: string
  path: string
  type: "file" | "dir"
  download_url?: string
}

interface TreeNode extends DocFile {
  children?: TreeNode[]
  expanded?: boolean
}

interface TOCItem {
  id: string
  text: string
  level: number
}

function extractTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const toc: TOCItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    toc.push({ id, text, level })
  }

  return toc
}

function FileTree({
  nodes,
  onSelect,
  selected,
  onToggle,
  depth = 0,
}: {
  nodes: TreeNode[]
  onSelect: (path: string) => void
  selected: string
  onToggle: (path: string) => void
  depth?: number
}) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <div key={node.path}>
          <button
            onClick={() => {
              if (node.type === "dir") {
                onToggle(node.path)
              } else if (node.name.endsWith(".md")) {
                onSelect(node.path)
              }
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left",
              selected === node.path ? "bg-foreground text-background" : "hover:bg-accent text-foreground",
            )}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            {node.type === "dir" ? (
              <>
                {node.expanded ? (
                  <ChevronDown className="w-4 h-4 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 shrink-0" />
                )}
                <Folder className="w-4 h-4 shrink-0" />
              </>
            ) : (
              <>
                <div className="w-4" />
                <FileText className="w-4 h-4 shrink-0" />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {node.type === "dir" && node.expanded && node.children && (
            <FileTree
              nodes={node.children}
              onSelect={onSelect}
              selected={selected}
              onToggle={onToggle}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export function DocsContent({ initialFiles }: { initialFiles: DocFile[] }) {
  const [tree, setTree] = useState<TreeNode[]>(() => initialFiles.map((f) => ({ ...f, expanded: false, children: [] })))
  const [selectedPath, setSelectedPath] = useState<string>("")
  const [content, setContent] = useState<string>("")
  const [toc, setToc] = useState<TOCItem[]>([])
  const [loading, setLoading] = useState(false)

  // Auto-select first markdown file
  useEffect(() => {
    const firstMd = initialFiles.find((f) => f.name.endsWith(".md"))
    if (firstMd) {
      handleSelect(firstMd.path)
    }
  }, [initialFiles])

  const handleToggle = async (path: string) => {
    const updateTree = async (nodes: TreeNode[]): Promise<TreeNode[]> => {
      return Promise.all(
        nodes.map(async (node) => {
          if (node.path === path) {
            if (!node.expanded && node.type === "dir") {
              const children = await fetchDocFiles(path)
              return {
                ...node,
                expanded: true,
                children: children.map((c) => ({ ...c, expanded: false, children: [] })),
              }
            }
            return { ...node, expanded: !node.expanded }
          }
          if (node.children) {
            return { ...node, children: await updateTree(node.children) }
          }
          return node
        }),
      )
    }
    setTree(await updateTree(tree))
  }

  const handleSelect = async (path: string) => {
    if (!path.endsWith(".md")) return
    setSelectedPath(path)
    setLoading(true)
    const fileContent = await fetchFileContent(path)
    setContent(fileContent)
    setToc(extractTOC(fileContent))
    setLoading(false)
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left Sidebar - File Tree */}
      <aside className="w-64 border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Documentation</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {tree.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No documentation files found</div>
          ) : (
            <FileTree nodes={tree} onSelect={handleSelect} selected={selectedPath} onToggle={handleToggle} />
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          ) : content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <div className="text-muted-foreground text-center py-20">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a markdown file to view its content</p>
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar - TOC */}
      <aside className="w-56 border-l border-border flex flex-col shrink-0 hidden lg:flex">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-sm">On this page</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {toc.length === 0 ? (
            <p className="text-sm text-muted-foreground">No headings found</p>
          ) : (
            <nav className="space-y-1">
              {toc.map((item, index) => (
                <button
                  key={index}
                  onClick={() => scrollToHeading(item.id)}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                  style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          )}
        </div>
      </aside>
    </div>
  )
}
