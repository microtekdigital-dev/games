'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

const EMULATOR_CORES = [
  { value: 'fceumm', label: 'FCEUmm (NES)' },
  { value: 'snes9x', label: 'Snes9x (SNES)' },
  { value: 'gambatte', label: 'Gambatte (Game Boy)' },
  { value: 'mgba', label: 'mGBA (GBA)' },
  { value: 'genesis_plus_gx', label: 'Genesis Plus GX (Genesis/SMS)' },
  { value: 'mupen64plus_next', label: 'Mupen64Plus (N64)' },
  { value: 'pcsx_rearmed', label: 'PCSX ReARMed (PlayStation)' },
  { value: 'stella', label: 'Stella (Atari 2600)' },
  { value: 'fbneo', label: 'FBNeo (Arcade/Neo Geo)' },
]

export default function NewConsolePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_name: '',
    description: '',
    manufacturer: '',
    release_year: '',
    emulator_core: 'fceumm',
    color: '#6366f1',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error } = await supabase.from('consoles').insert({
      ...formData,
      release_year: formData.release_year ? parseInt(formData.release_year) : null,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/admin/consoles')
      router.refresh()
    }
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <Link href="/admin/consoles" className="text-muted-foreground hover:text-foreground">Consoles</Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">New</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/consoles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add Console</h1>
            <p className="text-muted-foreground">Add a new gaming console</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Console Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nintendo Entertainment System"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_name">Short Name *</Label>
              <Input
                id="short_name"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                placeholder="NES"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="nes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Nintendo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="release_year">Release Year</Label>
              <Input
                id="release_year"
                type="number"
                value={formData.release_year}
                onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                placeholder="1983"
                min="1970"
                max="2010"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emulator_core">Emulator Core *</Label>
              <select
                id="emulator_core"
                value={formData.emulator_core}
                onChange={(e) => setFormData({ ...formData, emulator_core: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                {EMULATOR_CORES.map((core) => (
                  <option key={core.value} value={core.value}>
                    {core.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Theme Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#6366f1"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of the console..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Console'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/consoles">Cancel</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
