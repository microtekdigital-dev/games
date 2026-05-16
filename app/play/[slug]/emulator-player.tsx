'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Heart,
  Settings,
  Save,
  Download,
  Gamepad2,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import type { Game } from '@/lib/types'

interface EmulatorPlayerProps {
  game: Game
  userId?: string
  initialFavorite: boolean
}

declare global {
  interface Window {
    EJS_player: string
    EJS_core: string
    EJS_gameUrl: string
    EJS_gameName: string
    EJS_color: string
    EJS_startOnLoaded: boolean
    EJS_pathtodata: string
    EJS_oldEJSPath: string
    EJS_ready?: () => void
    EJS_onGameStart?: () => void
    EJS_gameID?: number
    EJS_DEBUG?: boolean
    EJS_VirtualGamepadSettings?: { enabled: boolean }
    EJS_mobileOptimized?: boolean
  }
}

export function EmulatorPlayer({ game, userId, initialFavorite }: EmulatorPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const consoleColor = game.console?.color || '#6366f1'

  useEffect(() => {
    // Log play history if user is logged in
    if (userId) {
      supabase.from('play_history').insert({
        user_id: userId,
        game_id: game.id,
      })
    }
  }, [userId, game.id, supabase])

  useEffect(() => {
    if (!game.rom_url) {
      setError('No ROM file available for this game')
      setIsLoading(false)
      return
    }

    // Set up EmulatorJS configuration BEFORE loading the script
    window.EJS_player = '#game-container'
    window.EJS_core = game.console?.emulator_core || 'fceumm'

    // URL already resolved server-side, use directly
    const resolveRomUrl = async () => {
      window.EJS_gameUrl = game.rom_url
      window.EJS_gameName = game.title
      window.EJS_color = consoleColor
      window.EJS_startOnLoaded = true
      window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/'
      window.EJS_VirtualGamepadSettings = { enabled: true }
      window.EJS_mobileOptimized = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      window.EJS_ready = () => setIsLoading(false)
      window.EJS_onGameStart = () => setIsLoading(false)

      const script = document.createElement('script')
      script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js'
      script.async = true
      script.onerror = () => { setError('Failed to load emulator'); setIsLoading(false) }
      scriptRef.current = script
      document.body.appendChild(script)
    }

    const timer = setTimeout(resolveRomUrl, 100)

    return () => {
      clearTimeout(timer)
      if (scriptRef.current && scriptRef.current.parentNode === document.body) {
        document.body.removeChild(scriptRef.current)
        scriptRef.current = null
      }
    }
  }, [game, consoleColor])

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleFavorite = async () => {
    if (!userId) return

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('game_id', game.id)
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, game_id: game.id })
    }
    setIsFavorite(!isFavorite)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Stop emulator audio/context when leaving the page
  useEffect(() => {
    const handleUnload = () => {
      try {
        // Close all AudioContexts
        const win = window as any
        if (win.EJS_emulator?.gameManager?.audioContext) {
          win.EJS_emulator.gameManager.audioContext.close()
        }
      } catch {}
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      handleUnload()
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="bg-background/90 backdrop-blur border-b border-border/50 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={game.console ? `/consoles/${game.console.slug}` : '/games'}
                className="gap-2"
                onClick={() => window.location.href = game.console ? `/consoles/${game.console.slug}` : '/games'}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            
            <div className="flex items-center gap-2">
              {game.console && (
                <span 
                  className="px-2 py-0.5 rounded text-xs font-bold text-white"
                  style={{ backgroundColor: consoleColor }}
                >
                  {game.console.short_name}
                </span>
              )}
              <h1 className="font-semibold truncate max-w-[200px] sm:max-w-none">
                {game.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFavorite}
                className="h-8 w-8"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Mute
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPaused(!isPaused)}>
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Save className="h-4 w-4 mr-2" />
                  Save State
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Load State
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <>
                      <Minimize className="h-4 w-4 mr-2" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <Maximize className="h-4 w-4 mr-2" />
                      Fullscreen
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Emulator Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-black relative"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center space-y-4">
              <div className="relative">
                <Gamepad2 className="h-16 w-16 mx-auto animate-pulse" style={{ color: consoleColor }} />
                <div 
                  className="absolute inset-0 blur-xl opacity-50"
                  style={{ backgroundColor: consoleColor }}
                />
              </div>
              <p className="text-muted-foreground">Loading {game.title}...</p>
              <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full animate-pulse rounded-full"
                  style={{ 
                    backgroundColor: consoleColor,
                    animation: 'loading 1.5s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center space-y-4 max-w-md px-4">
              <Info className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Unable to Load Game</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button asChild>
                <Link href="/games">Browse Other Games</Link>
              </Button>
            </div>
          </div>
        )}

        <div 
          id="game-container" 
          className="w-full h-full max-w-5xl aspect-video"
        />
      </div>

      {/* Game Info Footer */}
      <footer className="bg-background/90 backdrop-blur border-t border-border/50 px-4 py-3">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {game.developer && <span>Developer: {game.developer}</span>}
              {game.release_year && <span>Year: {game.release_year}</span>}
              {game.genre && <span>Genre: {game.genre}</span>}
            </div>
            <div className="flex items-center gap-2">
              <span>Controls: Arrow keys, Z/X for A/B, Enter for Start</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
