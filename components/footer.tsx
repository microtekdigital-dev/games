import Link from 'next/link'
import { Gamepad2, Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                <span className="text-primary">Retro</span>
                <span className="text-neon-cyan">Play</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Relive the golden age of gaming. Play classic retro games directly in your browser.
            </p>
          </div>

          {/* Consoles */}
          <div>
            <h4 className="font-semibold mb-4">Popular Consoles</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/consoles/nes" className="hover:text-primary transition-colors">NES</Link></li>
              <li><Link href="/consoles/snes" className="hover:text-primary transition-colors">Super Nintendo</Link></li>
              <li><Link href="/consoles/gb" className="hover:text-primary transition-colors">Game Boy</Link></li>
              <li><Link href="/consoles/gba" className="hover:text-primary transition-colors">Game Boy Advance</Link></li>
              <li><Link href="/consoles/genesis" className="hover:text-primary transition-colors">Sega Genesis</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/games" className="hover:text-primary transition-colors">All Games</Link></li>
              <li><Link href="/consoles" className="hover:text-primary transition-colors">All Consoles</Link></li>
              <li><Link href="/favorites" className="hover:text-primary transition-colors">My Favorites</Link></li>
              <li><Link href="/history" className="hover:text-primary transition-colors">Play History</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/dmca" className="hover:text-primary transition-colors">DMCA</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            2024 RetroPlay. For educational purposes only.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
