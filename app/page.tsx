import Link from 'next/link'
import { Gamepad2, Zap, Cloud, Smartphone, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ConsoleCard } from '@/components/console-card'
import { GameCard } from '@/components/game-card'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
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

  // Fetch consoles with game counts
  const { data: consoles } = await supabase
    .from('consoles')
    .select('*')
    .order('release_year', { ascending: true })
    .limit(6)

  // Fetch featured games
  const { data: featuredGames } = await supabase
    .from('games')
    .select('*, console:consoles(*)')
    .eq('is_featured', true)
    .order('play_count', { ascending: false })
    .limit(8)

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
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-neon-cyan/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 py-20 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span>Play instantly in your browser</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-primary neon-text">Retro</span>
                <span className="text-neon-cyan neon-text-cyan">Play</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                Relive the golden age of gaming. Play classic NES, SNES, Game Boy, Genesis and more directly in your browser.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild className="gap-2 pulse-glow">
                  <Link href="/consoles">
                    <Gamepad2 className="h-5 w-5" />
                    Start Playing
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/games">Browse All Games</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Instant Play</h3>
                <p className="text-sm text-muted-foreground">
                  No downloads required. Games load instantly in your browser.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-neon-cyan/10 flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-neon-cyan" />
                </div>
                <h3 className="font-semibold">Cloud Saves</h3>
                <p className="text-sm text-muted-foreground">
                  Your progress is saved in the cloud. Continue anywhere.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-neon-green/10 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-neon-green" />
                </div>
                <h3 className="font-semibold">Cross-Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Play on desktop, tablet, or mobile with gamepad support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Consoles Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Classic Consoles</h2>
                <p className="text-muted-foreground mt-1">Choose your favorite platform</p>
              </div>
              <Button variant="ghost" asChild className="gap-1">
                <Link href="/consoles">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
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
          </div>
        </section>

        {/* Featured Games */}
        {featuredGames && featuredGames.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Featured Games</h2>
                  <p className="text-muted-foreground mt-1">Popular titles to get started</p>
                </div>
                <Button variant="ghost" asChild className="gap-1">
                  <Link href="/games">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {featuredGames.map((game) => (
                  <GameCard key={game.id} game={game} showConsole />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-neon-cyan/10" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Play?</h2>
              <p className="text-lg text-muted-foreground">
                Create a free account to save your progress, track favorites, and access all features.
              </p>
              {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/auth/sign-up">Create Free Account</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/consoles">Play as Guest</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
