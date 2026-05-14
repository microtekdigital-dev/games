import { redirect } from 'next/navigation'
import Link from 'next/link'
import { History, Gamepad2, Clock, Calendar } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Play History - RetroPlay',
  description: 'Your gaming history',
}

export default async function HistoryPage() {
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

  const { data: history } = await supabase
    .from('play_history')
    .select('*, game:games(*, console:consoles(*))')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(50)

  // Group by date
  const groupedHistory: Record<string, typeof history> = {}
  history?.forEach(item => {
    const date = new Date(item.played_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!groupedHistory[date]) {
      groupedHistory[date] = []
    }
    groupedHistory[date]!.push(item)
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} profile={profile} />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-neon-cyan/10">
              <History className="h-6 w-6 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Play History</h1>
              <p className="text-muted-foreground">
                Your recent gaming sessions
              </p>
            </div>
          </div>

          {history && history.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium text-muted-foreground">{date}</h2>
                  </div>
                  <div className="space-y-2">
                    {items?.map((item) => (
                      <Link
                        key={item.id}
                        href={`/play/${item.game?.slug}`}
                        className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                      >
                        {/* Console Badge */}
                        {item.game?.console && (
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: item.game.console.color }}
                          >
                            {item.game.console.short_name}
                          </div>
                        )}

                        {/* Game Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{item.game?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.game?.console?.name}
                          </p>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(item.played_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">No play history yet</h2>
              <p className="text-muted-foreground mb-6">
                Start playing games to see your history here
              </p>
              <Link 
                href="/games" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Browse Games
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
