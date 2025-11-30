"use client"

import { useMemo } from "react"

interface MarkdownRendererProps {
  content: string
  currentPath?: string
}

const REPO_OWNER = "Alliance-Algorithm"
const REPO_NAME = "rmcs_auto_aim_v2"

export function MarkdownRenderer({ content, currentPath = "" }: MarkdownRendererProps) {
  const html = useMemo(() => parseMarkdown(content, currentPath), [content, currentPath])

  return (
    <article 
      className="max-w-none" 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  )
}

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

function parseMarkdown(md: string, currentPath: string = ""): string {
  let html = md

  // Escape HTML
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto border border-border mb-4"><code class="language-${lang} text-sm font-mono">${code.trim()}</code></pre>`
  })

  // Inline code - 使用柔和的灰色调
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono markdown-code">$1</code>')

  // Headers with IDs
  html = html.replace(/^######\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h6 id="${id}" class="text-sm font-semibold mt-4 mb-2 text-muted-foreground scroll-mt-20">${text}</h6>`
  })
  html = html.replace(/^#####\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h5 id="${id}" class="text-base font-semibold mt-4 mb-2 text-foreground scroll-mt-20">${text}</h5>`
  })
  html = html.replace(/^####\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h4 id="${id}" class="text-lg font-medium mt-4 mb-3 text-foreground scroll-mt-20">${text}</h4>`
  })
  html = html.replace(/^###\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h3 id="${id}" class="text-xl font-semibold mt-6 mb-4 text-foreground scroll-mt-20">${text}</h3>`
  })
  html = html.replace(/^##\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h2 id="${id}" class="text-2xl font-semibold mt-8 mb-4 pb-2 border-b border-border text-foreground scroll-mt-20">${text}</h2>`
  })
  html = html.replace(/^#\s+(.+)$/gm, (_, text) => {
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return `<h1 id="${id}" class="text-3xl font-bold mt-8 mb-6 first:mt-0 text-foreground scroll-mt-20">${text}</h1>`
  })

  // Links - 必须在斜体之前处理，使用占位符保护链接内容
  // 使用特殊格式的占位符，避免被其他正则匹配（使用特殊字符组合，不会被 Markdown 语法匹配）
  const linkPlaceholders: Array<{ placeholder: string; text: string; url: string }> = []
  let linkCounter = 0
  
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // 使用特殊格式的占位符，避免被粗体/斜体正则匹配
    const placeholder = `<!--LINK${linkCounter}-->`
    linkPlaceholders.push({ placeholder, text, url })
    linkCounter++
    return placeholder
  })

  // Bold and italic - 现在可以安全处理，链接已被占位符保护
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-semibold text-foreground"><em class="italic">$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
  html = html.replace(/___(.+?)___/g, '<strong class="font-semibold text-foreground"><em class="italic">$1</em></strong>')
  html = html.replace(/__(.+?)__/g, '<strong class="font-semibold text-foreground">$1</strong>')
  html = html.replace(/_(.+?)_/g, '<em class="italic">$1</em>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full h-auto border border-border my-4" />')

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="my-4 pl-3 border-l-4 border-primary/50 bg-muted/50 py-2 pr-4 rounded-r-lg italic text-foreground/80">$1</blockquote>')

  // Unordered lists
  html = html.replace(/^[*-]\s+(.+)$/gm, "<li class='mb-1 text-foreground'>$1</li>")
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="my-4 ml-4 space-y-1 list-disc">${match}</ul>`)

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li class='mb-1 text-foreground'>$1</li>")
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => {
    // 检查是否已经在 ul 中，如果是则跳过
    if (match.includes('<ul')) return match
    return `<ol class="my-4 ml-4 space-y-1 list-decimal">${match}</ol>`
  })

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-border" />')

  // Tables
  let tableRows: string[] = []
  let isFirstRow = true
  
  html = html.split('\n').map((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').map((c: string) => c.trim()).filter(Boolean)
      const isSeparator = cells.every((c: string) => /^:?-+:?$/.test(c))
      
      if (isSeparator) {
        isFirstRow = false
        return '' // 移除分隔符行
      }
      
      if (isFirstRow) {
        isFirstRow = false
        return `<thead class="bg-muted border-b border-border"><tr>${cells.map((c: string) => `<th class="px-4 py-3 text-left font-semibold text-foreground">${c}</th>`).join("")}</tr></thead>`
      } else {
        return `<tr class="hover:bg-accent/50 transition-colors">${cells.map((c: string) => `<td class="px-4 py-2 border-b border-border text-foreground">${c}</td>`).join("")}</tr>`
      }
    } else {
      isFirstRow = true
      return line
    }
  }).join('\n')
  
  // 将连续的表格行包裹在 table 标签中
  html = html.replace(/(<thead[^>]*>.*?<\/thead>\s*)(<tr[^>]*>.*?<\/tr>\s*)+/g, (match) => {
    return `<div class="my-6 overflow-x-auto rounded-lg border border-border"><table class="w-full text-sm"><tbody>${match}</tbody></table></div>`
  })
  
  // 处理没有表头的表格
  html = html.replace(/(<tr[^>]*>.*?<\/tr>\s*)+/g, (match) => {
    if (!match.includes('<table') && !match.includes('<thead')) {
      return `<div class="my-6 overflow-x-auto rounded-lg border border-border"><table class="w-full text-sm"><tbody>${match}</tbody></table></div>`
    }
    return match
  })

  // Paragraphs
  html = html.replace(/^(?!<[a-z])((?!^\s*$).+)$/gm, '<p class="leading-relaxed mb-4">$1</p>')

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, "")

  // 最后替换链接占位符（在所有处理完成后）
  for (const { placeholder, text, url } of linkPlaceholders) {
    const finalUrl = resolveRelativePath(url)
    // 使用蓝色作为链接颜色，在暗色模式下使用浅蓝色
    const linkHtml = `<a href="${finalUrl.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer" class="hover:underline inline-flex items-center gap-0.5 markdown-link">${text}</a>`
    while (html.includes(placeholder)) {
      html = html.replace(placeholder, linkHtml)
    }
  }

  return html
}
