import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  // Only allow archive.org
  if (!url.includes('archive.org')) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  // Follow redirects and return the final URL
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
  return NextResponse.json({ url: res.url })
}
