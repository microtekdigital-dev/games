'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, ArrowLeft, AlertCircle, Upload, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import type { Console } from '@/lib/types'

interface NewGameFormProps {
  consoles: Console[]
}

export function NewGameForm({ consoles }: NewGameFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    console_id: '',
    description: '',
    release_year: '',
    developer: '',
    publisher: '',
    genre: '',
    rom_url: '',
    rom_file_name: '',
    cover_image: '',
    is_featured: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  const selectedConsole = consoles.find((c) => c.id === formData.console_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!formData.console_id) {
      setError('Please select a console')
      setIsLoading(false)
      return
    }

    if (!formData.rom_url) {
      setError('Please provide a ROM URL or upload a ROM file')
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from('games').insert({
      ...formData,
      release_year: formData.release_year ? parseInt(formData.release_year) : null,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/admin/games')
      router.refresh()
    }
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    })
  }

  const fetchMetadata = async () => {
    if (!formData.title) return
    setIsFetching(true)
    setError(null)
    try {
      const res = await fetch('/api/game-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          console_name: selectedConsole?.name,
        }),
      })
      const text = await res.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Invalid response: ${text.slice(0, 100)}`)
      }
      if (data.error) throw new Error(data.error)
      setFormData((prev) => ({
        ...prev,
        developer: data.developer || prev.developer,
        publisher: data.publisher || prev.publisher,
        genre: data.genre || prev.genre,
        release_year: data.release_year?.toString() || prev.release_year,
        description: data.description || prev.description,
        cover_image: data.cover_image || prev.cover_image,
      }))
    } catch (e: any) {
      setError(`Auto-fill failed: ${e.message}`)
    } finally {
      setIsFetching(false)
    }
  }

  const handleRomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress('Uploading...')
    setError(null)

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${formData.slug || 'rom'}.${ext}`

    const { data, error: uploadError } = await supabase.storage
      .from('roms')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setIsUploading(false)
      setUploadProgress(null)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('roms').getPublicUrl(data.path)
    setFormData((prev) => ({ ...prev, rom_url: publicUrl, rom_file_name: file.name }))
    setUploadProgress(`✓ ${file.name}`)
    setIsUploading(false)
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
            <span className="font-semibold">New</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/games"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add Game</h1>
            <p className="text-muted-foreground">Add a new game to the library</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="console_id">Console *</Label>
            <select
              id="console_id"
              value={formData.console_id}
              onChange={(e) => setFormData({ ...formData, console_id: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              required
            >
              <option value="">Select a console...</option>
              {consoles.map((c) => (
                <option key={c.id} value={c.id}>{c.short_name} - {c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Game Title *</Label>
              <div className="flex gap-2">
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Super Mario Bros."
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={fetchMetadata}
                  disabled={isFetching || !formData.title}
                  title="Auto-fill with AI"
                >
                  <Sparkles className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Press ✨ to auto-fill metadata with AI</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="super-mario-bros"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="release_year">Release Year</Label>
              <Input
                id="release_year"
                type="number"
                value={formData.release_year}
                onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                placeholder="1985"
                min="1970"
                max="2010"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="developer">Developer</Label>
              <Input
                id="developer"
                value={formData.developer}
                onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                placeholder="Nintendo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="Platformer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Input
              id="publisher"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              placeholder="Nintendo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rom_url">ROM File *</Label>
            <Input
              id="rom_url"
              value={formData.rom_url}
              onChange={(e) => setFormData({ ...formData, rom_url: e.target.value })}
              placeholder="https://example.com/roms/game.nes or upload below"
            />
            <div className="flex items-center gap-2 mt-2">
              <label htmlFor="rom_file" className="cursor-pointer">
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload ROM file'}
                </div>
                <input
                  id="rom_file"
                  type="file"
                  accept=".nes,.smc,.sfc,.gb,.gbc,.gba,.md,.bin,.zip,.n64,.z64,.v64,.iso,.pbp,.cue,.img"
                  className="hidden"
                  onChange={handleRomUpload}
                  disabled={isUploading}
                />
              </label>
              {uploadProgress && (
                <span className="text-sm text-muted-foreground">{uploadProgress}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Accepts .zip, .nes, .smc, .gb, .gba, .md, .n64, .iso and more</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image URL</Label>
            <Input
              id="cover_image"
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              placeholder="https://example.com/covers/game.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of the game..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_featured: checked as boolean })
              }
            />
            <Label htmlFor="is_featured" className="cursor-pointer">
              Featured game (shown on homepage)
            </Label>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Game'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/games">Cancel</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
