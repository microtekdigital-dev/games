'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, ArrowLeft, AlertCircle, Upload, Sparkles, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import type { Console, Game } from '@/lib/types'
import Image from 'next/image'

interface EditGameFormProps {
  game: Game
  consoles: Console[]
}

export function EditGameForm({ game, consoles }: EditGameFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: game.title,
    slug: game.slug,
    console_id: game.console_id,
    description: game.description || '',
    release_year: game.release_year?.toString() || '',
    developer: game.developer || '',
    publisher: game.publisher || '',
    genre: game.genre || '',
    rom_url: game.rom_url || '',
    rom_file_name: game.rom_file_name || '',
    cover_image: game.cover_image || '',
    is_featured: game.is_featured,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const selectedConsole = consoles.find((c) => c.id === formData.console_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error } = await supabase
      .from('games')
      .update({
        ...formData,
        release_year: formData.release_year ? parseInt(formData.release_year) : null,
      })
      .eq('id', game.id)

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/admin/games')
      router.refresh()
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const { error } = await supabase.from('games').delete().eq('id', game.id)
    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/admin/games')
      router.refresh()
    }
  }

  const fetchMetadata = async () => {
    if (!formData.title) return
    setIsFetching(true)
    setError(null)
    try {
      const res = await fetch('/api/game-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, console_name: selectedConsole?.name }),
      })
      const text = await res.text()
      let data: any
      try { data = JSON.parse(text) } catch { throw new Error(`Invalid response: ${text.slice(0, 100)}`) }
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
      .from('roms').upload(fileName, file, { upsert: true })
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
            <span className="font-semibold">Edit</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/games"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Game</h1>
              <p className="text-muted-foreground">{game.title}</p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>

        {showDeleteConfirm && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Are you sure you want to delete "{game.title}"?</span>
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                  Delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <Label htmlFor="rom_url">ROM File</Label>
            <Input
              id="rom_url"
              value={formData.rom_url}
              onChange={(e) => setFormData({ ...formData, rom_url: e.target.value })}
              placeholder="https://..."
            />
            <div className="flex items-center gap-2 mt-2">
              <label htmlFor="rom_file" className="cursor-pointer">
                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Replace ROM file'}
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
              {uploadProgress && <span className="text-sm text-muted-foreground">{uploadProgress}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image URL</Label>
            <div className="flex gap-2 items-start">
              <Input
                id="cover_image"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="https://..."
              />
              {formData.cover_image && (
                <Image
                  src={formData.cover_image}
                  alt="cover"
                  width={40}
                  height={40}
                  className="rounded object-cover w-10 h-10 flex-shrink-0"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {isLoading ? 'Saving...' : 'Save Changes'}
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
