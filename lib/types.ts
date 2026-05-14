export interface Console {
  id: string
  name: string
  slug: string
  short_name: string
  description: string | null
  manufacturer: string | null
  release_year: number | null
  emulator_core: string
  cover_image: string | null
  banner_image: string | null
  color: string
  created_at: string
}

export interface Game {
  id: string
  console_id: string
  title: string
  slug: string
  description: string | null
  release_year: number | null
  developer: string | null
  publisher: string | null
  genre: string | null
  cover_image: string | null
  rom_url: string | null
  rom_file_name: string | null
  is_featured: boolean
  play_count: number
  created_at: string
  updated_at: string
  console?: Console
}

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  game_id: string
  created_at: string
  game?: Game
}

export interface PlayHistory {
  id: string
  user_id: string
  game_id: string
  played_at: string
  duration_seconds: number
  game?: Game
}

export interface SaveState {
  id: string
  user_id: string
  game_id: string
  slot: number
  state_data: string | null
  screenshot_url: string | null
  created_at: string
  updated_at: string
}
