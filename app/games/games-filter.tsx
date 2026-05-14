'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Console } from '@/lib/types'

interface GamesFilterProps {
  consoles: Console[]
  currentConsole?: string
}

export function GamesFilter({ consoles, currentConsole }: GamesFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleConsoleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('console')
    } else {
      params.set('console', value)
    }
    router.push(`/games?${params.toString()}`)
  }

  return (
    <Select value={currentConsole || 'all'} onValueChange={handleConsoleChange}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="All Consoles" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Consoles</SelectItem>
        {consoles.map((console) => (
          <SelectItem key={console.id} value={console.slug}>
            {console.short_name} - {console.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
