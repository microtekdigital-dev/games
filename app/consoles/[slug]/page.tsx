import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { GameCard } from '@/components/game-card'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: console } = await supabase
    .from('consoles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!console) return { title: 'Console Not Found' }

  return {
    title: `${console.name} Games - RetroPlay`,
    description: console.description || `Play ${console.name} games in your browser`,
  }
}

export default async function ConsolePage({ params }: Props) {
  const { slug } = await params
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

  const { data: console } = await supabase
    .from('consoles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!console) {
    notFound()
  }

  const { data: games } = await supabase
    .from('games')
    .select('*, console:consoles(*)')
    .eq('console_id', console.id)
    .order('title', { ascending: true })

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} profile={profile} />
      
      <main className="flex-1">
        {/* Console Hero */}
        <section 
          className="relative py-16"
          style={{ 
            background: `linear-gradient(135deg, ${console.color}20 0%, transparent 50%)`
          }}
        >
          <div className="container mx-auto px-4">
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/consoles" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                All Consoles
              </Link>
            </Button>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Console Icon */}
              <div 
                className="w-32 h-32 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${console.color}20` }}
              >
                <Gamepad2 className="h-16 w-16" style={{ color: console.color }} />
              </div>

              {/* Console Info */}
              <div className="space-y-4">
                <div>
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white mb-2"
                    style={{ backgroundColor: console.color }}
                  >
                    {console.short_name}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold">{console.name}</h1>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{console.manufacturer}</span>
                  {console.release_year && (
                    <>
                      <span>•</span>
                      <span>{console.release_year}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{games?.length || 0} games</span>
                </div>

                {console.description && (
                  <p className="text-muted-foreground max-w-2xl">
                    {console.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              {console.short_name} Games
            </h2>

            {games && games.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Gamepad2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No games available for this console yet.</p>
                <p className="text-sm mt-2">Check back later or browse other consoles.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
