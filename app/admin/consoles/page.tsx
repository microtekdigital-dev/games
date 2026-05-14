import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Manage Consoles - Admin',
}

export default async function AdminConsolesPage() {
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

  const { data: consoles } = await supabase
    .from('consoles')
    .select('*')
    .order('release_year', { ascending: true })

  // Get game counts
  const { data: gameCounts } = await supabase
    .from('games')
    .select('console_id')
  
  const countByConsole: Record<string, number> = {}
  gameCounts?.forEach(g => {
    countByConsole[g.console_id] = (countByConsole[g.console_id] || 0) + 1
  })

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
              <span className="font-semibold">Consoles</span>
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
              <h1 className="text-2xl font-bold">Consoles</h1>
              <p className="text-muted-foreground">Manage gaming consoles</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/consoles/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Console
            </Link>
          </Button>
        </div>

        {/* Consoles Table */}
        <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Console</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Manufacturer</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Year</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Core</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Games</th>
                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {consoles?.map((console) => (
                <tr key={console.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: console.color }}
                      >
                        {console.short_name.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{console.name}</p>
                        <p className="text-xs text-muted-foreground">{console.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{console.manufacturer}</td>
                  <td className="px-4 py-3 text-sm">{console.release_year}</td>
                  <td className="px-4 py-3 text-sm font-mono text-xs">{console.emulator_core}</td>
                  <td className="px-4 py-3 text-sm">{countByConsole[console.id] || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/consoles/${console.id}/edit`}>
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

          {(!consoles || consoles.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No consoles yet.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/consoles/new">Add your first console</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
