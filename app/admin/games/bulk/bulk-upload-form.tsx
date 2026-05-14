'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Gamepad2, ArrowLeft, Upload, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import type { Console } from '@/lib/types'
import Image from 'next/image'

interface BulkUploadFormProps {
  consoles: Console[]
}

type FileStatus = 'pending' | 'uploading' | 'fetching' | 'saving' | 'done' | 'error'

interface GameEntry {
  file: File
  title: string
  status: FileStatus
  error?: string
  cover_image?: string
  developer?: string
  genre?: string
  release_year?: string
}

function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')           // remove extension
    .replace(/[\._\-]+/g, ' ')         // replace separators with spaces
    .replace(/\(.*?\)|\[.*?\]/g, '')   // remove (USA), [!], etc.
    .trim()
    .replace(/\s+/g, ' ')
}

export function BulkUploadForm({ consoles }: BulkUploadFormProps) {
  const supabase = createClient()
  const [consoleId, setConsoleId] = useState('')
  const [entries, setEntries] = useState<GameEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const selectedConsole = consoles.find((c) => c.id === consoleId)

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files)
    const newEntries: GameEntry[] = arr.map((file) => ({
      file,
      title: titleFromFilename(file.name),
      status: 'pending',
    }))
    setEntries((prev) => [...prev, ...newEntries])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  const updateEntry = (index: number, patch: Partial<GameEntry>) => {
    setEntries((prev) => prev.map((e, i) => i === index ? { ...e, ...patch } : e))
  }

  const processEntry = async (entry: GameEntry, index: number) => {
    // 1. Upload ROM
    updateEntry(index, { status: 'uploading' })
    const ext = entry.file.name.split('.').pop()
    const fileName = `${Date.now()}-${entry.title.toLowerCase().replace(/\s+/g, '-')}.${ext}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('roms').upload(fileName, entry.file, { upsert: true })

    if (uploadError) {
      updateEntry(index, { status: 'error', error: uploadError.message })
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('roms').getPublicUrl(uploadData.path)

    // 2. Fetch metadata
    updateEntry(index, { status: 'fetching' })
    let metadata: any = {}
    try {
      const res = await fetch('/api/game-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: entry.title, console_name: selectedConsole?.name }),
      })
      const text = await res.text()
      metadata = JSON.parse(text)
      updateEntry(index, {
        cover_image: metadata.cover_image,
        developer: metadata.developer,
        genre: metadata.genre,
        release_year: metadata.release_year?.toString(),
      })
    } catch {
      // metadata fetch failed, continue without it
    }

    // 3. Save to DB
    updateEntry(index, { status: 'saving' })
    const slug = entry.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const { error: dbError } = await supabase.from('games').insert({
      title: entry.title,
      slug: `${slug}-${Date.now()}`,
      console_id: consoleId,
      rom_url: publicUrl,
      rom_file_name: entry.file.name,
      cover_image: metadata.cover_image || null,
      developer: metadata.developer || null,
      publisher: metadata.publisher || null,
      genre: metadata.genre || null,
      release_year: metadata.release_year || null,
      description: metadata.description || null,
      is_featured: false,
      play_count: 0,
    })

    if (dbError) {
      updateEntry(index, { status: 'error', error: dbError.message })
    } else {
      updateEntry(index, { status: 'done' })
    }
  }

  const startUpload = async () => {
    if (!consoleId) return
    setIsRunning(true)
    const pending = entries.map((e, i) => ({ e, i })).filter(({ e }) => e.status === 'pending')
    // Process 2 at a time to avoid rate limits
    for (let i = 0; i < pending.length; i += 2) {
      const batch = pending.slice(i, i + 2)
      await Promise.all(batch.map(({ e, i: idx }) => processEntry(e, idx)))
    }
    setIsRunning(false)
  }

  const pendingCount = entries.filter((e) => e.status === 'pending').length
  const doneCount = entries.filter((e) => e.status === 'done').length
  const errorCount = entries.filter((e) => e.status === 'error').length

  const statusIcon = (status: FileStatus) => {
    if (status === 'done') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === 'error') return <XCircle className="h-4 w-4 text-destructive" />
    if (['uploading', 'fetching', 'saving'].includes(status))
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
  }

  const statusLabel = (status: FileStatus) => {
    if (status === 'uploading') return 'Uploading ROM...'
    if (status === 'fetching') return 'Fetching metadata...'
    if (status === 'saving') return 'Saving...'
    if (status === 'done') return 'Done'
    if (status === 'error') return 'Error'
    return 'Pending'
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                <span className="text-primary">Retro</span>
                <span className="text-neon-cyan">Play</span>
              </span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/admin/games" className="text-muted-foreground hover:text-foreground">Games</Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">Bulk Upload</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/games"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bulk Upload</h1>
            <p className="text-muted-foreground">Upload multiple ROMs at once with AI metadata</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Console selector */}
          <div className="space-y-2">
            <Label htmlFor="console_id">Console *</Label>
            <select
              id="console_id"
              value={consoleId}
              onChange={(e) => setConsoleId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              disabled={isRunning}
            >
              <option value="">Select a console...</option>
              {consoles.map((c) => (
                <option key={c.id} value={c.id}>{c.short_name} - {c.name}</option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Drag & drop ROM files here</p>
            <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
            <label htmlFor="bulk_files" className="cursor-pointer">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
                Browse files
              </div>
              <input
                id="bulk_files"
                type="file"
                multiple
                accept=".nes,.smc,.sfc,.gb,.gbc,.gba,.md,.bin,.zip,.n64,.z64,.v64,.iso,.pbp,.cue,.img"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
                disabled={isRunning}
              />
            </label>
          </div>

          {/* File list */}
          {entries.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 text-sm">
                <span>{entries.length} files — {doneCount} done, {errorCount} errors, {pendingCount} pending</span>
                {doneCount > 0 && (
                  <Link href="/admin/games" className="text-primary text-xs hover:underline">
                    View games →
                  </Link>
                )}
              </div>
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {entries.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    {entry.cover_image ? (
                      <Image
                        src={entry.cover_image}
                        alt={entry.title}
                        width={32}
                        height={32}
                        className="rounded object-cover w-8 h-8 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{entry.file.name}</p>
                      {entry.error && (
                        <p className="text-xs text-destructive">{entry.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{statusLabel(entry.status)}</span>
                      {statusIcon(entry.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entries.length > 0 && !consoleId && (
            <Alert>
              <AlertDescription>Select a console before uploading.</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              onClick={startUpload}
              disabled={isRunning || pendingCount === 0 || !consoleId}
              className="gap-2"
            >
              {isRunning ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Upload {pendingCount} games</>
              )}
            </Button>
            {!isRunning && entries.length > 0 && (
              <Button variant="outline" onClick={() => setEntries([])}>Clear all</Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
