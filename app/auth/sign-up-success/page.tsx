import Link from 'next/link'
import { Gamepad2, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
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

        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <CheckCircle className="h-20 w-20 text-neon-green" />
            <div className="absolute inset-0 bg-neon-green/20 blur-xl rounded-full" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent you a confirmation link. Please check your email and click the link to activate your account.
          </p>
        </div>

        {/* Email Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">Go to Sign In</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email?{' '}
            <button className="text-primary hover:underline font-medium">
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
