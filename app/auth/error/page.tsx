import Link from 'next/link'
import { Gamepad2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2">
          <Gamepad2 className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold">
            <span className="text-primary">Retro</span>
            <span className="text-neon-cyan">Play</span>
          </span>
        </Link>

        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <AlertTriangle className="h-20 w-20 text-destructive" />
            <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground">
            Something went wrong during the authentication process. Please try again.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Try Again</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
