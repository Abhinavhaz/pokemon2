import type { PokemonApiResponse, PokemonListResponse, Pokemon } from "./types"

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2"

// Transform API response to our Pokemon interface
export function transformPokemonData(apiData: PokemonApiResponse): Pokemon {
  const stats = apiData.stats.reduce(
    (acc, stat) => {
      switch (stat.stat.name) {
        case "hp":
          acc.hp = stat.base_stat
          break
        case "attack":
          acc.attack = stat.base_stat
          break
        case "defense":
          acc.defense = stat.base_stat
          break
        case "special-attack":
          acc.specialAttack = stat.base_stat
          break
        case "special-defense":
          acc.specialDefense = stat.base_stat
          break
        case "speed":
          acc.speed = stat.base_stat
          break
      }
      return acc
    },
    {} as Partial<Pokemon>,
  )

  return {
    id: apiData.id,
    name: apiData.name.charAt(0).toUpperCase() + apiData.name.slice(1),
    sprite: apiData.sprites.other?.["official-artwork"]?.front_default || apiData.sprites.front_default,
    types: apiData.types.map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
    height: apiData.height,
    weight: apiData.weight,
    baseExperience: apiData.base_experience || 0,
    hp: stats.hp || 0,
    attack: stats.attack || 0,
    defense: stats.defense || 0,
    specialAttack: stats.specialAttack || 0,
    specialDefense: stats.specialDefense || 0,
    speed: stats.speed || 0,
  }
}

// Fetch a single Pokemon by ID
export async function fetchPokemon(id: number): Promise<Pokemon> {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon ${id}: ${response.statusText}`)
  }

  const data: PokemonApiResponse = await response.json()
  return transformPokemonData(data)
}

// Get the total count of Pokemon
export async function getPokemonCount(): Promise<number> {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1`)
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon count: ${response.statusText}`)
  }

  const data: PokemonListResponse = await response.json()
  return data.count
}

// Fetch Pokemon in batches for better performance
export async function fetchPokemonBatch(startId: number, batchSize: number): Promise<Pokemon[]> {
  const promises = []

  for (let i = startId; i < startId + batchSize; i++) {
    promises.push(
      fetchPokemon(i).catch((error) => {
        console.warn(`Failed to fetch Pokemon ${i}:`, error)
        return null
      }),
    )
  }

  const results = await Promise.all(promises)
  return results.filter((pokemon): pokemon is Pokemon => pokemon !== null)
}
