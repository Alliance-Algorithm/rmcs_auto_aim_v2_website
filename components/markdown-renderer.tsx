"use client"

import { useMemo } from "react"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => parseMarkdown(content), [content])

  return <article className="prose-custom" dangerouslySetInnerHTML={{ __html: html }} />
}

function parseMarkdown(md: string): string {
  let html = md

  // Escape HTML
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

  // Headers with IDs
  html = html.replace(/^######\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h6 id="${id}">${text}</h6>`
  })
  html = html.replace(/^#####\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h5 id="${id}">${text}</h5>`
  })
  html = html.replace(/^####\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h4 id="${id}">${text}</h4>`
  })
  html = html.replace(/^###\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h3 id="${id}">${text}</h3>`
  })
  html = html.replace(/^##\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h2 id="${id}">${text}</h2>`
  })
  html = html.replace(/^#\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h1 id="${id}">${text}</h1>`
  })

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>")
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>")
  html = html.replace(/_(.+?)_/g, "<em>$1</em>")

  // Links
  html = html.replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Images
  html = html.replace(/!\[([^\]]*)\]$$([^)]+)$$/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, "<blockquote>$1</blockquote>")

  // Unordered lists
  html = html.replace(/^[*-]\s+(.+)$/gm, "<li>$1</li>")
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />")

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (_, row) => {
    const cells = row.split("|").map((c: string) => c.trim())
    return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join("")}</tr>`
  })
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table>${match}</table>`)

  // Paragraphs
  html = html.replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, "<p>$1</p>")

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "")

  return html
}
