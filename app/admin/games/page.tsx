import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, ArrowLeft, Plus, Edit, Trash2, Star, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Manage Games - Admin',
}

export default async function AdminGamesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  const { data: games } = await supabase
    .from('games')
    .select('*, console:consoles(*)')
    .order('title', { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
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
              <span className="font-semibold">Games</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Games</h1>
              <p className="text-muted-foreground">Manage game library</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/games/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Game
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/games/bulk" className="gap-2">
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Link>
          </Button>
        </div>

        {/* Games Table */}
        <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Game</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Console</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Year</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Genre</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Plays</th>
                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {games?.map((game) => (
                <tr key={game.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {game.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{game.title}</p>
                        <p className="text-xs text-muted-foreground">{game.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {game.console && (
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: game.console.color }}
                      >
                        {game.console.short_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{game.release_year || '-'}</td>
                  <td className="px-4 py-3 text-sm">{game.genre || '-'}</td>
                  <td className="px-4 py-3 text-sm">{game.play_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/games/${game.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!games || games.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No games yet.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/games/new">Add your first game</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
