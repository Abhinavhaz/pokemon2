import type { Pokemon, CustomColumn } from "./types"

// CSV field mapping for built-in Pokemon fields
const POKEMON_FIELD_LABELS = {
  id: "ID",
  name: "Name",
  sprite: "Sprite URL",
  types: "Types",
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  specialAttack: "Special Attack",
  specialDefense: "Special Defense",
  speed: "Speed",
  height: "Height",
  weight: "Weight",
  baseExperience: "Base Experience",
} as const

// Escape CSV values that contain commas, quotes, or newlines
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return ""
  }

  let stringValue = String(value)

  // Handle arrays by joining with semicolons
  if (Array.isArray(value)) {
    stringValue = value.join("; ")
  }

  // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    stringValue = `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

// Generate CSV headers based on Pokemon data and custom columns
function generateCsvHeaders(customColumns: CustomColumn[]): string[] {
  const baseHeaders = [
    POKEMON_FIELD_LABELS.id,
    POKEMON_FIELD_LABELS.name,
    POKEMON_FIELD_LABELS.sprite,
    POKEMON_FIELD_LABELS.types,
    POKEMON_FIELD_LABELS.hp,
    POKEMON_FIELD_LABELS.attack,
    POKEMON_FIELD_LABELS.defense,
    POKEMON_FIELD_LABELS.specialAttack,
    POKEMON_FIELD_LABELS.specialDefense,
    POKEMON_FIELD_LABELS.speed,
    POKEMON_FIELD_LABELS.height,
    POKEMON_FIELD_LABELS.weight,
    POKEMON_FIELD_LABELS.baseExperience,
  ]

  const customHeaders = customColumns.map((col) => col.name)

  return [...baseHeaders, ...customHeaders]
}

// Convert a single Pokemon record to CSV row
function pokemonToCsvRow(pokemon: Pokemon, customColumns: CustomColumn[]): string[] {
  const baseValues = [
    pokemon.id,
    pokemon.name,
    pokemon.sprite || "",
    pokemon.types,
    pokemon.hp,
    pokemon.attack,
    pokemon.defense,
    pokemon.specialAttack,
    pokemon.specialDefense,
    pokemon.speed,
    pokemon.height,
    pokemon.weight,
    pokemon.baseExperience,
  ]

  const customValues = customColumns.map((col) => pokemon[col.id] ?? col.defaultValue)

  return [...baseValues, ...customValues].map(escapeCsvValue)
}

// Export Pokemon data to CSV format
export function exportPokemonToCsv(
  pokemon: Pokemon[],
  customColumns: CustomColumn[],
  onProgress?: (progress: { current: number; total: number }) => void,
): string {
  if (pokemon.length === 0) {
    return ""
  }

  const headers = generateCsvHeaders(customColumns)
  const csvLines = [headers.join(",")]

  // Process Pokemon in chunks to avoid blocking the UI
  pokemon.forEach((poke, index) => {
    const row = pokemonToCsvRow(poke, customColumns)
    csvLines.push(row.join(","))

    // Report progress every 100 records
    if (onProgress && (index % 100 === 0 || index === pokemon.length - 1)) {
      onProgress({ current: index + 1, total: pokemon.length })
    }
  })

  return csvLines.join("\n")
}

// Download CSV file
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Generate filename with timestamp
export function generateExportFilename(prefix = "pokemon-data"): string {
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, "-")
  return `${prefix}-${timestamp}.csv`
}

// Export filtered data (respects current table filters)
export function exportFilteredPokemonToCsv(
  allPokemon: Pokemon[],
  filteredPokemon: Pokemon[],
  customColumns: CustomColumn[],
  onProgress?: (progress: { current: number; total: number }) => void,
): string {
  return exportPokemonToCsv(filteredPokemon, customColumns, onProgress)
}

// Get export statistics
export interface ExportStats {
  totalRecords: number
  filteredRecords: number
  totalColumns: number
  customColumns: number
  estimatedFileSize: string
}

export function getExportStats(
  allPokemon: Pokemon[],
  filteredPokemon: Pokemon[],
  customColumns: CustomColumn[],
): ExportStats {
  const totalColumns = Object.keys(POKEMON_FIELD_LABELS).length + customColumns.length

  // Rough estimate: average 20 characters per field
  const estimatedBytes = filteredPokemon.length * totalColumns * 20
  const estimatedFileSize = formatFileSize(estimatedBytes)

  return {
    totalRecords: allPokemon.length,
    filteredRecords: filteredPokemon.length,
    totalColumns,
    customColumns: customColumns.length,
    estimatedFileSize,
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"

  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}
