'use client'

import { useState } from 'react'
import { GameCard } from '@/components/game-card'
import { createClient } from '@/lib/supabase/client'
import type { Game } from '@/lib/types'

interface FavoritesClientProps {
  initialGames: Game[]
  userId: string
}

export function FavoritesClient({ initialGames, userId }: FavoritesClientProps) {
  const [games, setGames] = useState(initialGames)
  const supabase = createClient()

  const handleToggleFavorite = async (gameId: string) => {
    // Remove from local state immediately for responsive UI
    setGames(games.filter(g => g.id !== gameId))
    
    // Remove from database
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          showConsole
          isFavorite={true}
          onToggleFavorite={() => handleToggleFavorite(game.id)}
        />
      ))}
    </div>
  )
}
