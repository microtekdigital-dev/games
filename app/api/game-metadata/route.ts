import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

async function fetchCoverImage(title: string): Promise<string | null> {
  const sgdbKey = process.env.STEAMGRIDDB_API_KEY
  if (!sgdbKey) return null

  try {
    // Search for the game
    const searchRes = await fetch(
      `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(title)}`,
      { headers: { Authorization: `Bearer ${sgdbKey}` } }
    )
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const gameId = searchData.data?.[0]?.id
    if (!gameId) return null

    // Get cover/grid image
    const gridRes = await fetch(
      `https://www.steamgriddb.com/api/v2/grids/game/${gameId}?dimensions=600x900`,
      { headers: { Authorization: `Bearer ${sgdbKey}` } }
    )
    if (!gridRes.ok) return null
    const gridData = await gridRes.json()
    return gridData.data?.[0]?.url || null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, console_name } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })
    }

    const groq = new Groq({ apiKey })

    // Run Groq and SteamGridDB in parallel
    const [chat, cover_image] = await Promise.all([
      groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a retro video game database expert. Given a game title and optionally a console name, return ONLY a valid JSON object with these exact fields:
{"developer":null,"publisher":null,"genre":null,"release_year":null,"description":null}
Fill in what you know. description max 150 chars. No markdown, no code blocks, just the JSON object.`,
          },
          {
            role: 'user',
            content: console_name ? `${title} (${console_name})` : title,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
      fetchCoverImage(title),
    ])

    const content = chat.choices[0]?.message?.content || ''
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ error: 'No JSON in response' }, { status: 500 })
    }

    const metadata = JSON.parse(match[0])
    return NextResponse.json({ ...metadata, cover_image })
  } catch (err: any) {
    console.error('game-metadata error:', err)
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
