"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import "highlight.js/styles/github.css"
import "highlight.js/styles/github-dark.css"

interface MarkdownRendererProps {
  content: string
  currentPath?: string
}

const REPO_OWNER = "Alliance-Algorithm"
const REPO_NAME = "rmcs_auto_aim_v2"

function resolveRelativePath(relativePath: string): string {
  // 如果已经是绝对 URL，直接返回
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://") || relativePath.startsWith("//") || relativePath.startsWith("#")) {
    return relativePath
  }

  // 所有相对链接都是 ../src/xxxx 格式
  // 直接转换为 GitHub 链接
  if (relativePath.startsWith("../src/")) {
    const srcPath = relativePath.substring("../src/".length)
    return `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/main/src/${srcPath}`
  }

  // 如果是其他相对路径格式，也尝试处理
  if (relativePath.startsWith("../")) {
    const path = relativePath.substring(3) // 移除 ../
    return `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/main/${path}`
  }

  // 默认返回原路径（可能是锚点或其他格式）
  return relativePath
}

export function MarkdownRenderer({ content, currentPath = "" }: MarkdownRendererProps) {
  return (
    <article className="max-w-none prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Headings
          h1: ({ node, children, ...props }) => {
            const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''
            const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return <h1 id={id} className="text-3xl font-bold mt-8 mb-6 first:mt-0 text-foreground scroll-mt-20" {...props}>{children}</h1>
          },
          h2: ({ node, children, ...props }) => {
            const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''
            const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return <h2 id={id} className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b border-border text-foreground scroll-mt-20" {...props}>{children}</h2>
          },
          h3: ({ node, children, ...props }) => {
            const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''
            const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return <h3 id={id} className="text-xl font-semibold mt-6 mb-4 text-foreground scroll-mt-20" {...props}>{children}</h3>
          },
          h4: ({ node, children, ...props }) => {
            const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''
            const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return <h4 id={id} className="text-lg font-medium mt-4 mb-3 text-foreground scroll-mt-20" {...props}>{children}</h4>
          },
          h5: ({ node, children, ...props }) => {
            const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''
            const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return <h5 id={id} className="text-base font-semibold mt-4 mb-2 text-foreground scroll-mt-20" {...props}>{children}</h5>
          },
          h6: ({ node, children, ...props }) => {
            const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : ''
            const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
            return <h6 id={id} className="text-sm font-semibold mt-4 mb-2 text-muted-foreground scroll-mt-20" {...props}>{children}</h6>
          },
          // Paragraphs
          p: ({ node, ...props }) => <p className="leading-relaxed mb-4" {...props} />,
          // Links
          a: ({ node, href, ...props }) => {
            const finalUrl = href ? resolveRelativePath(href) : href
            return (
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline inline-flex items-center gap-0.5 markdown-link text-primary"
                {...props}
              />
            )
          },
          // Images
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg max-w-full h-auto border border-border my-4"
              {...props}
            />
          ),
          // Code blocks
          pre: ({ node, ...props }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto border border-border mb-4" {...props} />
          ),
          code: ({ node, className, ...props }) => {
            const isInline = !className
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono markdown-code" {...props} />
            ) : (
              <code className={cn("text-sm font-mono", className)} {...props} />
            )
          },
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-4 pl-3 border-l-4 border-primary/50 bg-muted/50 py-2 pr-4 rounded-r-lg italic text-foreground/80"
              {...props}
            />
          ),
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="my-4 ml-4 space-y-1 list-disc" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-4 ml-4 space-y-1 list-decimal" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-1 text-foreground" {...props} />
          ),
          // Horizontal rules
          hr: ({ node, ...props }) => <hr className="my-8 border-border" {...props} />,
          // Tables
          table: ({ node, ...props }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted border-b border-border" {...props} />
          ),
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-accent/50 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left font-semibold text-foreground" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 border-b border-border text-foreground" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
