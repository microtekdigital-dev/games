import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, MonitorPlay, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Admin Panel - RetroPlay',
  description: 'Manage consoles and games',
}

export default async function AdminPage() {
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

  // Get stats
  const { count: consoleCount } = await supabase
    .from('consoles')
    .select('*', { count: 'exact', head: true })

  const { count: gameCount } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

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
              <span className="font-semibold">Admin Panel</span>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/">Back to Site</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MonitorPlay className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consoles</p>
                <p className="text-2xl font-bold">{consoleCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-neon-cyan/10">
                <Gamepad2 className="h-6 w-6 text-neon-cyan" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Games</p>
                <p className="text-2xl font-bold">{gameCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-neon-green/10">
                <Settings className="h-6 w-6 text-neon-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-2xl font-bold">{userCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link 
            href="/admin/consoles/new"
            className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">Add Console</span>
          </Link>
          <Link 
            href="/admin/games/new"
            className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-neon-cyan/10">
              <Plus className="h-5 w-5 text-neon-cyan" />
            </div>
            <span className="font-medium">Add Game</span>
          </Link>
          <Link 
            href="/admin/consoles"
            className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-secondary">
              <MonitorPlay className="h-5 w-5" />
            </div>
            <span className="font-medium">Manage Consoles</span>
          </Link>
          <Link 
            href="/admin/games"
            className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-secondary">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <span className="font-medium">Manage Games</span>
          </Link>
        </div>

        {/* Navigation */}
        <h2 className="text-xl font-bold mb-4">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/admin/consoles"
            className="group p-6 bg-card rounded-xl border border-border/50 hover:border-primary/50 transition-all"
          >
            <MonitorPlay className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
              Consoles
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add, edit, and manage gaming consoles. Configure emulator cores and console metadata.
            </p>
          </Link>
          <Link 
            href="/admin/games"
            className="group p-6 bg-card rounded-xl border border-border/50 hover:border-primary/50 transition-all"
          >
            <Gamepad2 className="h-10 w-10 text-neon-cyan mb-4" />
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
              Games
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload ROMs, add game metadata, and manage the game library.
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
