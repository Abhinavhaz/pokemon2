"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin as Mapping, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { POKEMON_FIELDS, generateSuggestedMappings, transformCSVToPokemon } from "@/lib/csv-utils"
import { usePokemonStore } from "@/lib/store"
import type { ColumnMapping } from "@/lib/types"

interface SchemaMappingProps {
  csvData: any[]
  csvHeaders: string[]
  fileName: string
  onComplete: () => void
  onCancel: () => void
}

export function SchemaMapping({ csvData, csvHeaders, fileName, onComplete, onCancel }: SchemaMappingProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { setPokemon } = usePokemonStore()

  // Initialize with suggested mappings
  useEffect(() => {
    const suggested = generateSuggestedMappings(csvHeaders)
    setMappings(suggested)
  }, [csvHeaders])

  const handleMappingChange = (csvColumn: string, pokemonField: string, dataType: string) => {
    setMappings((prev) => {
      const existing = prev.find((m) => m.csvColumn === csvColumn)
      const newMapping: ColumnMapping = {
        csvColumn,
        pokemonField,
        dataType: dataType as "string" | "number" | "boolean" | "array",
      }

      if (existing) {
        return prev.map((m) => (m.csvColumn === csvColumn ? newMapping : m))
      } else {
        return [...prev, newMapping]
      }
    })
  }

  const removeMappingForColumn = (csvColumn: string) => {
    setMappings((prev) => prev.filter((m) => m.csvColumn !== csvColumn))
  }

  const handleProcessData = async () => {
    if (mappings.length === 0) {
      setError("Please map at least one column to proceed")
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress({ current: 0, total: csvData.length })

    try {
      // Process data in chunks to avoid blocking the UI
      await new Promise((resolve) => setTimeout(resolve, 100))

      const transformedPokemon = transformCSVToPokemon(csvData, mappings, setProgress)

      // Update the store with the new Pokemon data
      setPokemon(transformedPokemon)

      setProgress(null)
      setIsProcessing(false)
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process CSV data")
      setIsProcessing(false)
      setProgress(null)
    }
  }

  const getMappingForColumn = (csvColumn: string) => {
    return mappings.find((m) => m.csvColumn === csvColumn)
  }

  const progressPercentage = progress ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mapping className="h-5 w-5" />
            Schema Mapping
          </CardTitle>
          <CardDescription>
            Map columns from <strong>{fileName}</strong> ({csvData.length.toLocaleString()} rows) to Pokemon data fields
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Processing Progress */}
      {isProcessing && progress && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">Processing CSV data...</span>
              </div>
              <Progress value={progressPercentage} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {progress.current.toLocaleString()} / {progress.total.toLocaleString()} rows processed
                </span>
                <span>{progressPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column Mappings */}
      {!isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mappings</CardTitle>
            <CardDescription>
              Map each CSV column to a Pokemon data field. Unmapped columns will be ignored.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {csvHeaders.map((header) => {
                const mapping = getMappingForColumn(header)
                return (
                  <div key={header} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{header}</div>
                      <div className="text-sm text-muted-foreground">CSV Column</div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    <div className="flex-1">
                      <Select
                        value={mapping ? `${mapping.pokemonField}:${mapping.dataType}` : ""}
                        onValueChange={(value) => {
                          if (value === "none") {
                            removeMappingForColumn(header)
                          } else {
                            const [pokemonField, dataType] = value.split(":")
                            handleMappingChange(header, pokemonField, dataType)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Pokemon field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">Don't map this column</span>
                          </SelectItem>
                          {Object.entries(POKEMON_FIELDS).map(([key, field]) => (
                            <SelectItem key={key} value={`${key}:${field.type}`}>
                              <div className="flex items-center gap-2">
                                <span>{field.label}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {field.type}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {mappings.length} of {csvHeaders.length} columns mapped
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handleProcessData} disabled={isProcessing || mappings.length === 0}>
                  Process Data ({csvData.length.toLocaleString()} rows)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
