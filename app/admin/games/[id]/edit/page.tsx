import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditGameForm } from './edit-game-form'

export const metadata = { title: 'Edit Game - Admin' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditGamePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  const { data: game } = await supabase
    .from('games').select('*, console:consoles(*)').eq('id', id).single()
  if (!game) notFound()

  const { data: consoles } = await supabase
    .from('consoles').select('*').order('name', { ascending: true })

  return <EditGameForm game={game} consoles={consoles || []} />
}
