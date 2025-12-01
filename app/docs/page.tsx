import { Header } from "@/components/header"
import { DocsContent } from "@/components/docs-content"
import { fetchDocFiles } from "@/lib/github"

export default async function DocsPage() {
  const docFiles = await fetchDocFiles()

  // 尝试获取根目录的 README.md
  let readmeFile = null
  try {
    const rootFiles = await fetchDocFiles("")
    const readme = rootFiles.find((f) => f.name.toLowerCase() === "readme.md" && f.type === "file")
    if (readme) {
      readmeFile = readme
    }
  } catch {
    // 如果获取根目录文件失败，忽略
  }

  // 将 README.md 添加到文件列表的开头
  const files = readmeFile ? [readmeFile, ...docFiles] : docFiles

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DocsContent initialFiles={files} />
    </div>
  )
}
