"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Trash2, Loader2, AlertCircle, CheckCircle, Upload, Zap } from "lucide-react"
import { usePokemonStore } from "@/lib/store"
import { useBulkFetchPokemon, usePokemonCount } from "@/lib/queries"
import { CSVUpload } from "./csv-upload"
import { SchemaMapping } from "./schema-mapping"
import { useState } from "react"

type UploadState = "idle" | "file-selected" | "mapping"

export function DataSourceManager() {
  const { pokemon, clearPokemon, isLoading, fetchProgress } = usePokemonStore()
  const { data: totalPokemonCount } = usePokemonCount()
  const bulkFetchMutation = useBulkFetchPokemon()
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // CSV upload state
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [fileName, setFileName] = useState<string>("")

  const handleFetchPokedex = async () => {
    setFetchError(null)
    try {
      await bulkFetchMutation.mutateAsync()
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Failed to fetch Pokemon data")
    }
  }

  const handleFileProcessed = (data: any[], headers: string[], name: string) => {
    setCsvData(data)
    setCsvHeaders(headers)
    setFileName(name)
    setUploadState("mapping")
    setUploadError(null)
  }

  const handleUploadError = (error: string) => {
    setUploadError(error)
    setUploadState("idle")
  }

  const handleMappingComplete = () => {
    setUploadState("idle")
    setCsvData([])
    setCsvHeaders([])
    setFileName("")
  }

  const handleMappingCancel = () => {
    setUploadState("idle")
    setCsvData([])
    setCsvHeaders([])
    setFileName("")
  }

  const progressPercentage = fetchProgress ? Math.round((fetchProgress.current / fetchProgress.total) * 100) : 0

  // Show schema mapping interface
  if (uploadState === "mapping") {
    return (
      <SchemaMapping
        csvData={csvData}
        csvHeaders={csvHeaders}
        fileName={fileName}
        onComplete={handleMappingComplete}
        onCancel={handleMappingCancel}
      />
    )
  }

  return (
    <div className="space-y-8">
      {fetchError && (
        <Alert variant="destructive" className="border-2 border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-base">{fetchError}</AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive" className="border-2 border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-base">{uploadError}</AlertDescription>
        </Alert>
      )}

      {pokemon.length > 0 && !isLoading && !fetchError && (
        <Alert className="border-2 border-primary/20 bg-primary/5">
          <CheckCircle className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base text-primary">
            Successfully loaded {pokemon.length.toLocaleString()} Pokemon records! 🎉
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div>PokeAPI Integration</div>
                <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-primary/20">
                  Official Data
                </Badge>
              </div>
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Fetch comprehensive Pokemon data from the official PokeAPI
              {totalPokemonCount && (
                <span className="block mt-1 font-medium text-primary">
                  {totalPokemonCount.toLocaleString()} total Pokemon available
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <Button
              className="w-full h-12 text-base font-medium"
              size="lg"
              onClick={handleFetchPokedex}
              disabled={isLoading || bulkFetchMutation.isPending}
            >
              {isLoading || bulkFetchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Fetching Pokemon Data...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Fetch Full Pokedex Dataset
                </>
              )}
            </Button>

            {fetchProgress && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                <Progress value={progressPercentage} className="w-full h-3" />
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {fetchProgress.current.toLocaleString()} / {fetchProgress.total.toLocaleString()} Pokemon
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {progressPercentage}%
                  </Badge>
                </div>
              </div>
            )}

            <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                This will fetch detailed information for all Pokemon from the PokeAPI. The process may take a few
                minutes to complete and will show real-time progress updates.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-accent/30 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Upload className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div>CSV File Upload</div>
                <Badge variant="secondary" className="mt-1 bg-accent/10 text-accent border-accent/20">
                  Custom Data
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CSVUpload onFileProcessed={handleFileProcessed} onError={handleUploadError} />
          </CardContent>
        </Card>
      </div>

      {pokemon.length > 0 && (
        <Card className="border-2 border-destructive/20 hover:border-destructive/30 transition-colors">
          <CardHeader className="bg-gradient-to-r from-destructive/5 to-destructive/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg text-destructive">
              <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              Clear All Data
            </CardTitle>
            <CardDescription className="text-base">
              Remove all Pokemon data from the application. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Button
              variant="destructive"
              onClick={clearPokemon}
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Clear All Pokemon Data ({pokemon.length.toLocaleString()} records)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
