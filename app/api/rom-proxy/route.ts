import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  // Only allow archive.org and known ROM hosts
  const allowed = ['archive.org', 'supabase.co']
  const isAllowed = allowed.some((host) => url.includes(host))
  if (!isAllowed) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })

  if (!res.ok) {
    return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: res.status })
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  const body = await res.arrayBuffer()

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
