import Link from 'next/link'
import Image from 'next/image'
import { Play, Heart, Gamepad } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Game } from '@/lib/types'

interface GameCardProps {
  game: Game
  showConsole?: boolean
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function GameCard({ game, showConsole = false, isFavorite = false, onToggleFavorite }: GameCardProps) {
  const consoleColors: Record<string, string> = {
    nes: '#e60012',
    snes: '#7b5aa6',
    gb: '#8bac0f',
    gba: '#4f43ae',
    genesis: '#0066cc',
    sms: '#cc0000',
    n64: '#00a94f',
    psx: '#003087',
    atari2600: '#ff6600',
    neogeo: '#ffd700',
  }

  const consoleSlug = game.console?.slug || ''
  const accentColor = consoleColors[consoleSlug] || '#6366f1'

  return (
    <div className="game-card group relative bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/50">
      {/* Cover Image */}
      <Link href={`/play/${game.slug}`} className="block aspect-[3/4] relative overflow-hidden">
        {game.cover_image ? (
          <Image
            src={game.cover_image}
            alt={game.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Gamepad className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            Play Now
          </Button>
        </div>

        {/* Console Badge */}
        {showConsole && game.console && (
          <div 
            className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {game.console.short_name}
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
            />
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link href={`/play/${game.slug}`}>
          <h3 className="font-semibold text-sm truncate hover:text-primary transition-colors">
            {game.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {game.release_year || 'Unknown'}
          </span>
          {game.genre && (
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {game.genre}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
