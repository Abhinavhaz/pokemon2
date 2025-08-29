import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PokemonStore, Pokemon, CustomColumn } from "./types"

export const usePokemonStore = create<PokemonStore>()(
  persist(
    (set, get) => ({
      // Initial state
      pokemon: [],
      customColumns: [],
      isLoading: false,
      fetchProgress: null,

      // Pokemon data actions
      setPokemon: (pokemon: Pokemon[]) => {
        set({ pokemon })
      },

      addPokemon: (newPokemon: Pokemon) => {
        set((state) => ({
          pokemon: [...state.pokemon, newPokemon],
        }))
      },

      updatePokemon: (id: number, updates: Partial<Pokemon>) => {
        set((state) => ({
          pokemon: state.pokemon.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      deletePokemon: (id: number) => {
        set((state) => ({
          pokemon: state.pokemon.filter((p) => p.id !== id),
        }))
      },

      clearPokemon: () => {
        set({ pokemon: [], fetchProgress: null })
      },

      // Custom columns
      addCustomColumn: (column: CustomColumn) => {
        set((state) => {
          // Add the column definition
          const newCustomColumns = [...state.customColumns, column]

          // Add the default value to all existing pokemon
          const updatedPokemon = state.pokemon.map((pokemon) => ({
            ...pokemon,
            [column.id]: column.defaultValue,
          }))

          return {
            customColumns: newCustomColumns,
            pokemon: updatedPokemon,
          }
        })
      },

      removeCustomColumn: (columnId: string) => {
        set((state) => {
          // Remove the column definition
          const newCustomColumns = state.customColumns.filter((col) => col.id !== columnId)

          // Remove the column from all pokemon data
          const updatedPokemon = state.pokemon.map((pokemon) => {
            const { [columnId]: removed, ...rest } = pokemon
            return rest
          })

          return {
            customColumns: newCustomColumns,
            pokemon: updatedPokemon,
          }
        })
      },

      // Loading states
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setFetchProgress: (progress: { current: number; total: number } | null) => {
        set({ fetchProgress: progress })
      },

      // Bulk operations for performance
      bulkUpdatePokemon: (updates: Array<{ id: number; updates: Partial<Pokemon> }>) => {
        set((state) => {
          const updateMap = new Map(updates.map((u) => [u.id, u.updates]))

          const updatedPokemon = state.pokemon.map((pokemon) => {
            const update = updateMap.get(pokemon.id)
            return update ? { ...pokemon, ...update } : pokemon
          })

          return { pokemon: updatedPokemon }
        })
      },
    }),
    {
      name: "pokemon-research-lab-storage",
      // Only persist the pokemon data and custom columns, not loading states
      partialize: (state) => ({
        pokemon: state.pokemon,
        customColumns: state.customColumns,
      }),
    },
  ),
)
