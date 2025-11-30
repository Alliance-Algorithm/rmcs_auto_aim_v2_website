import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

function extractFilenameFromUrl(url: string) {
  try {
    const cleanedUrl = url.split("?")[0].split("#")[0]
    const parts = cleanedUrl.split("/")
    return parts[parts.length - 1] || ""
  } catch {
    return ""
  }
}

function sanitizeFilename(name?: string) {
  if (!name) {
    return "download"
  }

  const trimmed = name.trim()
  if (!trimmed) {
    return "download"
  }

  const withoutQuotes = trimmed.replace(/"/g, "")
  const sanitized = withoutQuotes.replace(/[^a-zA-Z0-9._-]/g, "_")

  return sanitized || "download"
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const assetUrl = searchParams.get("url")
  const filenameParam = searchParams.get("filename")

  if (!assetUrl) {
    return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 })
  }

  const fallbackFilename = filenameParam || extractFilenameFromUrl(assetUrl) || "download"
  const filename = sanitizeFilename(fallbackFilename)

  try {
    const response = await fetch(assetUrl, { cache: "no-store" })

    if (!response.ok) {
      return NextResponse.json({ error: "无法下载资源" }, { status: response.status })
    }

    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") ?? "application/octet-stream"

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return NextResponse.json({ error: "无法下载资源" }, { status: 500 })
  }
}
