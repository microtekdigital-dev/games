import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BulkUploadForm } from './bulk-upload-form'

export const metadata = { title: 'Bulk Upload - Admin' }

export default async function BulkUploadPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  const { data: consoles } = await supabase
    .from('consoles').select('*').order('name', { ascending: true })

  return <BulkUploadForm consoles={consoles || []} />
}
