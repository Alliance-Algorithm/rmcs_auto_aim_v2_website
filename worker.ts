const ASSET_CACHE_HEADERS = {
  'Cache-Control': 'no-store',
}

function extractFilenameFromUrl(url: string) {
  try {
    const cleanedUrl = url.split('?')[0].split('#')[0]
    const segments = cleanedUrl.split('/')
    return segments[segments.length - 1] || 'download'
  } catch {
    return 'download'
  }
}

function sanitizeFilename(name: string | null) {
  if (!name) return 'download'
  const trimmed = name.trim()
  if (!trimmed) return 'download'
  const noQuotes = trimmed.replace(/"/g, '')
  const sanitized = noQuotes.replace(/[^a-zA-Z0-9._-]/g, '_')
  return sanitized || 'download'
}

type AssetsBinding = {
  fetch(request: Request): Promise<Response>
}

async function handleDownload(request: Request) {
  const url = new URL(request.url)
  const assetUrl = url.searchParams.get('url')
  const filenameParam = url.searchParams.get('filename')

  if (!assetUrl) {
    return new Response(JSON.stringify({ error: '缺少 url 参数' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...ASSET_CACHE_HEADERS },
    })
  }

  const fallbackFilename = filenameParam ?? extractFilenameFromUrl(assetUrl)
  const filename = sanitizeFilename(fallbackFilename)

  try {
    const response = await fetch(assetUrl)
    if (!response.ok || !response.body) {
      return new Response(JSON.stringify({ error: '无法下载资源' }), {
        status: response.status || 500,
        headers: { 'Content-Type': 'application/json', ...ASSET_CACHE_HEADERS },
      })
    }

    const contentType = response.headers.get('content-type') ?? 'application/octet-stream'

    return new Response(response.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        ...ASSET_CACHE_HEADERS,
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: '无法下载资源' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...ASSET_CACHE_HEADERS },
    })
  }
}

export default {
  async fetch(request: Request, env: { ASSETS: AssetsBinding }) {
    const url = new URL(request.url)

    if (url.pathname === '/api/resources/download') {
      if (request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405, headers: ASSET_CACHE_HEADERS })
      }
      return handleDownload(request)
    }

    return env.ASSETS.fetch(request)
  },
}
