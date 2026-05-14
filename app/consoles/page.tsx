import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ConsoleCard } from '@/components/console-card'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'All Consoles - RetroPlay',
  description: 'Browse all classic gaming consoles available on RetroPlay',
}

export default async function ConsolesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const { data: consoles } = await supabase
    .from('consoles')
    .select('*')
    .order('release_year', { ascending: true })

  // Get game counts per console
  const { data: gameCounts } = await supabase
    .from('games')
    .select('console_id')
  
  const countByConsole: Record<string, number> = {}
  gameCounts?.forEach(g => {
    countByConsole[g.console_id] = (countByConsole[g.console_id] || 0) + 1
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} profile={profile} />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">All Consoles</h1>
            <p className="text-muted-foreground mt-2">
              Choose your favorite platform and start playing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {consoles?.map((console) => (
              <ConsoleCard 
                key={console.id} 
                console={console} 
                gameCount={countByConsole[console.id] || 0}
              />
            ))}
          </div>

          {(!consoles || consoles.length === 0) && (
            <div className="text-center py-20 text-muted-foreground">
              <p>No consoles available yet.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
