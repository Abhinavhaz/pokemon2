// Core Pokemon data types
export interface PokemonStat {
  base_stat: number
  stat: {
    name: string
  }
}

export interface PokemonType {
  type: {
    name: string
  }
}

export interface PokemonSprites {
  front_default: string | null
  other?: {
    "official-artwork"?: {
      front_default: string | null
    }
  }
}

// Raw API response types
export interface PokemonApiResponse {
  id: number
  name: string
  types: PokemonType[]
  stats: PokemonStat[]
  sprites: PokemonSprites
  height: number
  weight: number
  base_experience: number
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    name: string
    url: string
  }>
}

// Processed Pokemon data for our table
export interface Pokemon {
  id: number
  name: string
  sprite: string | null
  types: string[]
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
  height: number
  weight: number
  baseExperience: number
  // Dynamic columns will be added here
  [key: string]: any
}

// Column definition for dynamic columns
export interface CustomColumn {
  id: string
  name: string
  type: "text" | "number" | "boolean"
  defaultValue: string | number | boolean
}

// CSV mapping types
export interface CsvColumn {
  header: string
  index: number
}

export interface ColumnMapping {
  csvColumn: string
  pokemonField: keyof Pokemon | string
  dataType: "string" | "number" | "boolean" | "array"
}

// Store state types
export interface PokemonStore {
  // Data
  pokemon: Pokemon[]
  customColumns: CustomColumn[]

  // Loading states
  isLoading: boolean
  fetchProgress: { current: number; total: number } | null

  // Actions
  setPokemon: (pokemon: Pokemon[]) => void
  addPokemon: (pokemon: Pokemon) => void
  updatePokemon: (id: number, updates: Partial<Pokemon>) => void
  deletePokemon: (id: number) => void
  clearPokemon: () => void

  // Custom columns
  addCustomColumn: (column: CustomColumn) => void
  removeCustomColumn: (columnId: string) => void

  // Loading states
  setLoading: (loading: boolean) => void
  setFetchProgress: (progress: { current: number; total: number } | null) => void

  // Bulk operations
  bulkUpdatePokemon: (updates: Array<{ id: number; updates: Partial<Pokemon> }>) => void
}
