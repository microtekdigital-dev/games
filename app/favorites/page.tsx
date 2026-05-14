import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, Gamepad2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { GameCard } from '@/components/game-card'
import { createClient } from '@/lib/supabase/server'
import { FavoritesClient } from './favorites-client'

export const metadata = {
  title: 'My Favorites - RetroPlay',
  description: 'Your favorite retro games',
}

export default async function FavoritesPage() {
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

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, game:games(*, console:consoles(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const games = favorites?.map(f => f.game).filter(Boolean) || []

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} profile={profile} />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-red-500/10">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Favorites</h1>
              <p className="text-muted-foreground">
                {games.length} {games.length === 1 ? 'game' : 'games'} saved
              </p>
            </div>
          </div>

          {games.length > 0 ? (
            <FavoritesClient initialGames={games} userId={user.id} />
          ) : (
            <div className="text-center py-20">
              <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6">
                Start adding games to your favorites by clicking the heart icon
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
