import type { Pokemon, CustomColumn } from "./types"

export interface CommandResult {
  success: boolean
  message: string
  affectedCount?: number
  error?: string
}

export interface ParsedCommand {
  action: "set" | "update" | "delete" | "add"
  field?: string
  value?: any
  conditions?: Array<{
    field: string
    operator: "equals" | "contains" | "greater" | "less" | "in"
    value: any
  }>
}

const FIELD_ALIASES: Record<string, string> = {
  // Stats
  hp: "hp",
  health: "hp",
  "hit points": "hp",
  attack: "attack",
  atk: "attack",
  defense: "defense",
  def: "defense",
  "special attack": "specialAttack",
  "sp attack": "specialAttack",
  "sp atk": "specialAttack",
  spatk: "specialAttack",
  "special defense": "specialDefense",
  "sp defense": "specialDefense",
  "sp def": "specialDefense",
  spdef: "specialDefense",
  speed: "speed",
  spe: "speed",

  // Basic info
  name: "name",
  id: "id",
  height: "height",
  weight: "weight",

  // Types
  type: "types",
  types: "types",

  // Experience
  experience: "baseExperience",
  "base experience": "baseExperience",
  exp: "baseExperience",

  // Abilities
  ability: "abilities",
  abilities: "abilities",

  // Generation (if available)
  generation: "generation",
  gen: "generation",

  // Forms
  form: "forms",
  forms: "forms",

  // Species
  species: "species",
}

export function parseCommand(input: string, customColumns: CustomColumn[] = []): ParsedCommand | null {
  const normalizedInput = input.toLowerCase().trim()

  // Add custom columns to field aliases
  const allFieldAliases = { ...FIELD_ALIASES }
  customColumns.forEach((col) => {
    allFieldAliases[col.name.toLowerCase()] = col.name
  })

  // SET commands: "set hp to 100 for all pokemon of type 'grass'"
  const setMatch = normalizedInput.match(/set\s+([a-zA-Z\s]+?)\s+to\s+(.+?)(?:\s+for\s+(.+))?$/)
  if (setMatch) {
    const [, fieldStr, valueStr, conditionStr] = setMatch
    const field = resolveField(fieldStr.trim(), allFieldAliases)
    const value = parseValue(valueStr.trim())
    const conditions = conditionStr ? parseConditions(conditionStr, allFieldAliases) : []

    if (field) {
      return {
        action: "set",
        field,
        value,
        conditions,
      }
    }
  }

  // UPDATE commands: "update ability to 'levitate' where name is 'gengar'"
  const updateMatch = normalizedInput.match(/update\s+([a-zA-Z\s]+?)\s+to\s+(.+?)(?:\s+where\s+(.+))?$/)
  if (updateMatch) {
    const [, fieldStr, valueStr, conditionStr] = updateMatch
    const field = resolveField(fieldStr.trim(), allFieldAliases)
    const value = parseValue(valueStr.trim())
    const conditions = conditionStr ? parseConditions(conditionStr, allFieldAliases) : []

    if (field) {
      return {
        action: "update",
        field,
        value,
        conditions,
      }
    }
  }

  // DELETE commands: "delete rows where generation is 1"
  const deleteMatch = normalizedInput.match(/delete\s+(?:rows?\s+)?where\s+(.+)$/)
  if (deleteMatch) {
    const [, conditionStr] = deleteMatch
    const conditions = parseConditions(conditionStr, allFieldAliases)

    return {
      action: "delete",
      conditions,
    }
  }

  return null
}

function resolveField(fieldStr: string, fieldAliases: Record<string, string>): string | null {
  const normalized = fieldStr.toLowerCase().trim()
  return fieldAliases[normalized] || null
}

// Parse values with type inference
function parseValue(valueStr: string): any {
  const trimmed = valueStr.trim()

  // Remove quotes
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1)
  }

  // Parse numbers
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Number.parseFloat(trimmed)
  }

  // Parse booleans
  if (trimmed === "true") return true
  if (trimmed === "false") return false

  // Parse arrays (comma-separated)
  if (trimmed.includes(",")) {
    return trimmed.split(",").map((item) => item.trim())
  }

  return trimmed
}

function parseConditions(
  conditionStr: string,
  fieldAliases: Record<string, string>,
): Array<{
  field: string
  operator: "equals" | "contains" | "greater" | "less" | "in"
  value: any
}> {
  const conditions: Array<{
    field: string
    operator: "equals" | "contains" | "greater" | "less" | "in"
    value: any
  }> = []

  // Split by "and" to handle multiple conditions
  const parts = conditionStr.split(/\s+and\s+/)

  for (const part of parts) {
    const trimmed = part.trim()

    // "field is value" or "field equals value"
    let match = trimmed.match(/([a-zA-Z\s]+?)\s+(?:is|equals)\s+(.+)/)
    if (match) {
      const [, fieldStr, valueStr] = match
      const field = resolveField(fieldStr.trim(), fieldAliases)
      if (field) {
        conditions.push({
          field,
          operator: "equals",
          value: parseValue(valueStr),
        })
      }
      continue
    }

    // "field contains value"
    match = trimmed.match(/([a-zA-Z\s]+?)\s+contains\s+(.+)/)
    if (match) {
      const [, fieldStr, valueStr] = match
      const field = resolveField(fieldStr.trim(), fieldAliases)
      if (field) {
        conditions.push({
          field,
          operator: "contains",
          value: parseValue(valueStr),
        })
      }
      continue
    }

    // "field > value" or "field greater than value"
    match = trimmed.match(/([a-zA-Z\s]+?)\s+(?:>|greater\s+than)\s+(.+)/)
    if (match) {
      const [, fieldStr, valueStr] = match
      const field = resolveField(fieldStr.trim(), fieldAliases)
      if (field) {
        conditions.push({
          field,
          operator: "greater",
          value: parseValue(valueStr),
        })
      }
      continue
    }

    // "field < value" or "field less than value"
    match = trimmed.match(/([a-zA-Z\s]+?)\s+(?:<|less\s+than)\s+(.+)/)
    if (match) {
      const [, fieldStr, valueStr] = match
      const field = resolveField(fieldStr.trim(), fieldAliases)
      if (field) {
        conditions.push({
          field,
          operator: "less",
          value: parseValue(valueStr),
        })
      }
      continue
    }

    // "pokemon of type 'value'" pattern
    match = trimmed.match(/(?:all\s+)?pokemon\s+of\s+type\s+(.+)/)
    if (match) {
      const [, typeValue] = match
      conditions.push({
        field: "types",
        operator: "contains",
        value: parseValue(typeValue),
      })
      continue
    }

    // "field in [value1, value2]"
    match = trimmed.match(/([a-zA-Z\s]+?)\s+in\s+(.+)/)
    if (match) {
      const [, fieldStr, valueStr] = match
      const field = resolveField(fieldStr.trim(), fieldAliases)
      if (field) {
        conditions.push({
          field,
          operator: "in",
          value: parseValue(valueStr),
        })
      }
      continue
    }
  }

  return conditions
}

export function executeCommand(
  command: ParsedCommand,
  pokemon: Pokemon[],
  customColumns: CustomColumn[],
  updatePokemon: (id: number, updates: Partial<Pokemon>) => void,
  deletePokemon: (id: number) => void,
  bulkUpdatePokemon: (updates: Array<{ id: number; updates: Partial<Pokemon> }>) => void,
): CommandResult {
  try {
    if (command.action === "delete") {
      const toDelete = pokemon.filter((p) => matchesConditions(p, command.conditions || [], customColumns))

      if (toDelete.length === 0) {
        return {
          success: false,
          message: "No Pokemon matched the deletion criteria",
        }
      }

      toDelete.forEach((p) => deletePokemon(p.id))

      return {
        success: true,
        message: `Successfully deleted ${toDelete.length} Pokemon`,
        affectedCount: toDelete.length,
      }
    }

    if (command.action === "set" || command.action === "update") {
      if (!command.field) {
        return {
          success: false,
          message: "No field specified for update",
        }
      }

      const toUpdate = pokemon.filter((p) => matchesConditions(p, command.conditions || [], customColumns))

      if (toUpdate.length === 0) {
        return {
          success: false,
          message: "No Pokemon matched the update criteria",
        }
      }

      const updates = toUpdate.map((p) => ({
        id: p.id,
        updates: { [command.field!]: command.value },
      }))

      bulkUpdatePokemon(updates)

      return {
        success: true,
        message: `Successfully updated ${command.field} for ${toUpdate.length} Pokemon`,
        affectedCount: toUpdate.length,
      }
    }

    return {
      success: false,
      message: "Unsupported command action",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to execute command",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function matchesConditions(
  pokemon: Pokemon,
  conditions: Array<{
    field: string
    operator: "equals" | "contains" | "greater" | "less" | "in"
    value: any
  }>,
  customColumns: CustomColumn[] = [],
): boolean {
  return conditions.every((condition) => {
    // Handle custom columns
    const customCol = customColumns.find((col) => col.name === condition.field)
    let pokemonValue: any

    if (customCol) {
      pokemonValue = (pokemon as any)[condition.field]
    } else {
      pokemonValue = (pokemon as any)[condition.field]
    }

    switch (condition.operator) {
      case "equals":
        return String(pokemonValue).toLowerCase() === String(condition.value).toLowerCase()
      case "contains":
        if (Array.isArray(pokemonValue)) {
          return pokemonValue.some((item) => String(item).toLowerCase().includes(String(condition.value).toLowerCase()))
        }
        return String(pokemonValue).toLowerCase().includes(String(condition.value).toLowerCase())
      case "greater":
        return Number(pokemonValue) > Number(condition.value)
      case "less":
        return Number(pokemonValue) < Number(condition.value)
      case "in":
        if (Array.isArray(condition.value)) {
          return condition.value.some((val) => String(pokemonValue).toLowerCase() === String(val).toLowerCase())
        }
        return String(pokemonValue).toLowerCase() === String(condition.value).toLowerCase()
      default:
        return false
    }
  })
}

// Get example commands for help
export function getExampleCommands(): string[] {
  return [
    "set hp to 100 for all pokemon of type grass",
    "update attack to 150 where name is pikachu",
    "set speed to 200 where hp greater than 100",
    "delete rows where attack less than 50",
    "set defense to 80 for all pokemon",
    "update name to Super Charizard where name contains charizard",
  ]
}
