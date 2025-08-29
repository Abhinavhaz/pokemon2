"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataSourceManager } from "./data-source-manager"
import { PokemonDataTable } from "./pokemon-data-table"
import { usePokemonStore } from "@/lib/store"
import { usePokemonCount } from "@/lib/queries"
import { Database, Table, Activity, Zap } from "lucide-react"

export function PokemonResearchLab() {
  const { pokemon, isLoading, fetchProgress, customColumns } = usePokemonStore()
  const { data: totalPokemonCount } = usePokemonCount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Research Tool
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            The Pokemon Research Lab
          </h1>
          <p className="text-muted-foreground text-xl text-balance max-w-2xl mx-auto leading-relaxed">
            Advanced Pokemon data analysis and manipulation tool with AI-powered natural language commands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Loaded Pokemon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{pokemon.length.toLocaleString()}</div>
              {totalPokemonCount && (
                <div className="text-sm text-muted-foreground mt-1">
                  of {totalPokemonCount.toLocaleString()} total available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Table className="h-4 w-4 text-accent" />
                Custom Columns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{customColumns.length}</div>
              <div className="text-sm text-muted-foreground mt-1">user-defined fields</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-3" />
                Data Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-3">{pokemon.length > 0 ? "Active" : "Empty"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {pokemon.length > 0 ? "PokeAPI + Custom" : "No data loaded"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-chart-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-4">{isLoading ? "Loading" : "Ready"}</div>
              {fetchProgress && (
                <div className="text-sm text-muted-foreground mt-1">
                  {fetchProgress.current.toLocaleString()} / {fetchProgress.total.toLocaleString()} Pokemon
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="data-sources" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-muted/50 p-1">
              <TabsTrigger
                value="data-sources"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Database className="h-4 w-4" />
                Data Sources
              </TabsTrigger>
              <TabsTrigger
                value="data-table"
                disabled={pokemon.length === 0}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Table className="h-4 w-4" />
                Data Table
                {pokemon.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {pokemon.length.toLocaleString()}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="data-sources" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Database className="h-5 w-5 text-primary" />
                  Data Sources
                </CardTitle>
                <CardDescription className="text-base">
                  Load Pokemon data from the PokeAPI or upload your own CSV files for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <DataSourceManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-table" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Table className="h-5 w-5 text-primary" />
                  Pokemon Data Table
                </CardTitle>
                <CardDescription className="text-base">
                  Interactive, high-performance table for analyzing and editing Pokemon data with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <PokemonDataTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
