import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EmulatorPlayer } from './emulator-player'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: game } = await supabase
    .from('games')
    .select('*, console:consoles(*)')
    .eq('slug', slug)
    .single()

  if (!game) return { title: 'Game Not Found' }

  return {
    title: `Play ${game.title} - RetroPlay`,
    description: game.description || `Play ${game.title} on ${game.console?.name}`,
  }
}

export default async function PlayPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: game } = await supabase
    .from('games')
    .select('*, console:consoles(*)')
    .eq('slug', slug)
    .single()

  if (!game) {
    notFound()
  }

  // Increment play count
  await supabase
    .from('games')
    .update({ play_count: (game.play_count || 0) + 1 })
    .eq('id', game.id)

  // Check if user has favorited this game
  let isFavorite = false
  if (user) {
    const { data: favorite } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', game.id)
      .single()
    isFavorite = !!favorite
  }

  return (
    <EmulatorPlayer 
      game={game} 
      userId={user?.id} 
      initialFavorite={isFavorite}
    />
  )
}
