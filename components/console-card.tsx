import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Gamepad2 } from 'lucide-react'
import type { Console } from '@/lib/types'

interface ConsoleCardProps {
  console: Console
  gameCount?: number
}

export function ConsoleCard({ console: consoleData, gameCount }: ConsoleCardProps) {
  return (
    <Link 
      href={`/consoles/${consoleData.slug}`}
      className="group relative flex flex-col bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Banner/Cover */}
      <div 
        className="aspect-video relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${consoleData.color}30 0%, ${consoleData.color}10 100%)`
        }}
      >
        {consoleData.banner_image ? (
          <Image
            src={consoleData.banner_image}
            alt={consoleData.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : consoleData.cover_image ? (
          <Image
            src={consoleData.cover_image}
            alt={consoleData.name}
            fill
            className="object-contain p-8 transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 
              className="h-20 w-20 transition-transform group-hover:scale-110"
              style={{ color: consoleData.color }}
            />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Console Badge */}
        <div 
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: consoleData.color }}
        >
          {consoleData.short_name}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
          {consoleData.name}
        </h3>
        
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span>{consoleData.manufacturer}</span>
          {consoleData.release_year && (
            <>
              <span>•</span>
              <span>{consoleData.release_year}</span>
            </>
          )}
        </div>

        {consoleData.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {consoleData.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
          {typeof gameCount === 'number' && (
            <span className="text-sm text-muted-foreground">
              {gameCount} {gameCount === 1 ? 'game' : 'games'}
            </span>
          )}
          <span className="flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
            Browse Games
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
