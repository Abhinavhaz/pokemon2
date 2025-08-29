import Papa from "papaparse"
import type { Pokemon, ColumnMapping } from "./types"

// Available Pokemon fields for mapping
export const POKEMON_FIELDS = {
  id: { label: "ID", type: "number" as const },
  name: { label: "Name", type: "string" as const },
  types: { label: "Types", type: "array" as const },
  hp: { label: "HP", type: "number" as const },
  attack: { label: "Attack", type: "number" as const },
  defense: { label: "Defense", type: "number" as const },
  specialAttack: { label: "Special Attack", type: "number" as const },
  specialDefense: { label: "Special Defense", type: "number" as const },
  speed: { label: "Speed", type: "number" as const },
  height: { label: "Height", type: "number" as const },
  weight: { label: "Weight", type: "number" as const },
  baseExperience: { label: "Base Experience", type: "number" as const },
} as const

// Data type conversion utilities
export function convertValue(value: string, targetType: "string" | "number" | "boolean" | "array"): any {
  if (!value || value.trim() === "") {
    switch (targetType) {
      case "string":
        return ""
      case "number":
        return 0
      case "boolean":
        return false
      case "array":
        return []
    }
  }

  switch (targetType) {
    case "string":
      return String(value).trim()
    case "number":
      const num = Number.parseFloat(value)
      return isNaN(num) ? 0 : num
    case "boolean":
      return ["true", "1", "yes", "on"].includes(value.toLowerCase().trim())
    case "array":
      // Handle comma-separated values or JSON arrays
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          return JSON.parse(value)
        } catch {
          return [value]
        }
      }
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    default:
      return value
  }
}

// Parse CSV file with streaming
export function parseCSVFile(
  file: File,
  onProgress: (progress: { current: number; total: number }) => void,
  onComplete: (data: any[], headers: string[]) => void,
  onError: (error: string) => void,
): void {
  let headers: string[] = []
  let rowCount = 0
  const data: any[] = []

  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    chunk: (results, parser) => {
      if (results.errors.length > 0) {
        onError(`CSV parsing error: ${results.errors[0].message}`)
        parser.abort()
        return
      }

      results.data.forEach((row: any, index) => {
        if (headers.length === 0) {
          // First row contains headers
          headers = row as string[]
        } else {
          // Convert array row to object using headers
          const rowObject: any = {}
          headers.forEach((header, i) => {
            rowObject[header] = row[i] || ""
          })
          data.push(rowObject)
          rowCount++
        }
      })

      // Update progress (approximate since we don't know total rows upfront)
      onProgress({ current: rowCount, total: rowCount + 100 })
    },
    complete: () => {
      onProgress({ current: rowCount, total: rowCount })
      onComplete(data, headers)
    },
    error: (error) => {
      onError(`Failed to parse CSV: ${error.message}`)
    },
  })
}

// Apply column mappings to transform CSV data to Pokemon format
export function transformCSVToPokemon(
  csvData: any[],
  mappings: ColumnMapping[],
  onProgress: (progress: { current: number; total: number }) => void,
): Pokemon[] {
  const pokemon: Pokemon[] = []
  const total = csvData.length

  csvData.forEach((row, index) => {
    const pokemonData: Partial<Pokemon> = {
      // Default values
      id: index + 1,
      name: "",
      sprite: null,
      types: [],
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
      height: 0,
      weight: 0,
      baseExperience: 0,
    }

    // Apply mappings
    mappings.forEach((mapping) => {
      const csvValue = row[mapping.csvColumn]
      if (csvValue !== undefined) {
        const convertedValue = convertValue(csvValue, mapping.dataType)
        ;(pokemonData as any)[mapping.pokemonField] = convertedValue
      }
    })

    pokemon.push(pokemonData as Pokemon)

    // Update progress every 100 rows
    if (index % 100 === 0 || index === total - 1) {
      onProgress({ current: index + 1, total })
    }
  })

  return pokemon
}

// Generate suggested mappings based on column names
export function generateSuggestedMappings(csvHeaders: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = []

  csvHeaders.forEach((header) => {
    const lowerHeader = header.toLowerCase().trim()
    let pokemonField: keyof Pokemon | null = null
    let dataType: "string" | "number" | "boolean" | "array" = "string"

    // Smart matching based on common column names
    if (lowerHeader.includes("id") || lowerHeader === "#") {
      pokemonField = "id"
      dataType = "number"
    } else if (lowerHeader.includes("name")) {
      pokemonField = "name"
      dataType = "string"
    } else if (lowerHeader.includes("type")) {
      pokemonField = "types"
      dataType = "array"
    } else if (lowerHeader.includes("hp") || lowerHeader.includes("health")) {
      pokemonField = "hp"
      dataType = "number"
    } else if (lowerHeader.includes("attack") && !lowerHeader.includes("special")) {
      pokemonField = "attack"
      dataType = "number"
    } else if (lowerHeader.includes("defense") && !lowerHeader.includes("special")) {
      pokemonField = "defense"
      dataType = "number"
    } else if (lowerHeader.includes("special") && lowerHeader.includes("attack")) {
      pokemonField = "specialAttack"
      dataType = "number"
    } else if (lowerHeader.includes("special") && lowerHeader.includes("defense")) {
      pokemonField = "specialDefense"
      dataType = "number"
    } else if (lowerHeader.includes("speed")) {
      pokemonField = "speed"
      dataType = "number"
    } else if (lowerHeader.includes("height")) {
      pokemonField = "height"
      dataType = "number"
    } else if (lowerHeader.includes("weight")) {
      pokemonField = "weight"
      dataType = "number"
    } else if (lowerHeader.includes("experience")) {
      pokemonField = "baseExperience"
      dataType = "number"
    }

    if (pokemonField) {
      mappings.push({
        csvColumn: header,
        pokemonField,
        dataType,
      })
    }
  })

  return mappings
}
