import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { GameCard } from '@/components/game-card'
import { createClient } from '@/lib/supabase/server'
import { GamesFilter } from './games-filter'

export const metadata = {
  title: 'All Games - RetroPlay',
  description: 'Browse all classic retro games available on RetroPlay',
}

interface Props {
  searchParams: Promise<{ console?: string; search?: string }>
}

export default async function GamesPage({ searchParams }: Props) {
  const params = await searchParams
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

  // Fetch all consoles for filter
  const { data: consoles } = await supabase
    .from('consoles')
    .select('*')
    .order('name', { ascending: true })

  // Build games query
  let gamesQuery = supabase
    .from('games')
    .select('*, console:consoles(*)')
    .order('title', { ascending: true })

  if (params.console) {
    const { data: consoleData } = await supabase
      .from('consoles')
      .select('id')
      .eq('slug', params.console)
      .single()
    
    if (consoleData) {
      gamesQuery = gamesQuery.eq('console_id', consoleData.id)
    }
  }

  if (params.search) {
    gamesQuery = gamesQuery.ilike('title', `%${params.search}%`)
  }

  const { data: games } = await gamesQuery

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} profile={profile} />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">All Games</h1>
            <p className="text-muted-foreground mt-2">
              Browse and play your favorite retro games
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <form>
                <Input
                  name="search"
                  placeholder="Search games..."
                  defaultValue={params.search}
                  className="pl-10"
                />
              </form>
            </div>
            
            <GamesFilter 
              consoles={consoles || []} 
              currentConsole={params.console}
            />
          </div>

          {/* Games Grid */}
          {games && games.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {games.length} {games.length === 1 ? 'game' : 'games'} found
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} showConsole />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No games found.</p>
              {params.search && (
                <p className="text-sm mt-2">Try a different search term.</p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
