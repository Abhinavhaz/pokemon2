import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usePokemonStore } from "./store"
import { fetchPokemon, fetchPokemonBatch, getPokemonCount } from "./pokemon-api"
import type { Pokemon } from "./types"

// Query keys
export const pokemonKeys = {
  all: ["pokemon"] as const,
  count: () => [...pokemonKeys.all, "count"] as const,
  single: (id: number) => [...pokemonKeys.all, "single", id] as const,
  batch: (startId: number, batchSize: number) => [...pokemonKeys.all, "batch", startId, batchSize] as const,
}

// Get total Pokemon count
export function usePokemonCount() {
  return useQuery({
    queryKey: pokemonKeys.count(),
    queryFn: getPokemonCount,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

// Fetch a single Pokemon
export function usePokemon(id: number) {
  return useQuery({
    queryKey: pokemonKeys.single(id),
    queryFn: () => fetchPokemon(id),
    enabled: id > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

// Fetch Pokemon in batches
export function usePokemonBatch(startId: number, batchSize: number, enabled = true) {
  return useQuery({
    queryKey: pokemonKeys.batch(startId, batchSize),
    queryFn: () => fetchPokemonBatch(startId, batchSize),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

// Mutation for bulk fetching all Pokemon
export function useBulkFetchPokemon() {
  const queryClient = useQueryClient()
  const { setPokemon, setLoading, setFetchProgress, addPokemon } = usePokemonStore()

  return useMutation({
    mutationFn: async () => {
      setLoading(true)
      setFetchProgress({ current: 0, total: 0 })

      try {
        // First, get the total count
        const totalCount = await getPokemonCount()
        setFetchProgress({ current: 0, total: totalCount })

        const batchSize = 20 // Fetch 20 Pokemon at a time
        const allPokemon: Pokemon[] = []

        // Fetch Pokemon in batches
        for (let startId = 1; startId <= totalCount; startId += batchSize) {
          const endId = Math.min(startId + batchSize - 1, totalCount)

          try {
            const batch = await fetchPokemonBatch(startId, Math.min(batchSize, totalCount - startId + 1))
            allPokemon.push(...batch)

            // Update progress
            setFetchProgress({ current: allPokemon.length, total: totalCount })

            // Update store incrementally for better UX
            if (allPokemon.length % 100 === 0 || allPokemon.length === totalCount) {
              setPokemon([...allPokemon])
            }
          } catch (error) {
            console.warn(`Failed to fetch batch ${startId}-${endId}:`, error)
            // Continue with next batch even if one fails
          }

          // Small delay to prevent overwhelming the API
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Final update with all Pokemon
        setPokemon(allPokemon)
        setFetchProgress(null)

        return allPokemon
      } catch (error) {
        setFetchProgress(null)
        throw error
      } finally {
        setLoading(false)
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: pokemonKeys.all })
    },
    onError: (error) => {
      console.error("Failed to fetch Pokemon data:", error)
      setLoading(false)
      setFetchProgress(null)
    },
  })
}
