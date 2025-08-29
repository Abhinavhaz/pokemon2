"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { usePokemonStore } from "@/lib/store"
import { exportPokemonToCsv, downloadCsv, generateExportFilename, getExportStats } from "@/lib/export-utils"
import type { Pokemon } from "@/lib/types"

interface ExportDialogProps {
  filteredPokemon: Pokemon[]
  trigger?: React.ReactNode
}

export function ExportDialog({ filteredPokemon, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { pokemon, customColumns } = usePokemonStore()
  const stats = getExportStats(pokemon, filteredPokemon, customColumns)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)
    setSuccess(false)
    setProgress({ current: 0, total: filteredPokemon.length })

    try {
      // Add a small delay to show the progress UI
      await new Promise((resolve) => setTimeout(resolve, 100))

      const csvContent = exportPokemonToCsv(filteredPokemon, customColumns, (progressData) => setProgress(progressData))

      if (!csvContent) {
        throw new Error("No data to export")
      }

      const filename = generateExportFilename("pokemon-research-lab")
      downloadCsv(csvContent, filename)

      setSuccess(true)
      setProgress(null)

      // Auto-close dialog after successful export
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export data")
      setProgress(null)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    if (!isExporting) {
      setOpen(false)
      setError(null)
      setSuccess(false)
      setProgress(null)
    }
  }

  const progressPercentage = progress ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Pokemon Data
          </DialogTitle>
          <DialogDescription>Export your Pokemon dataset to a CSV file for use in other applications</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>CSV file has been downloaded successfully!</AlertDescription>
            </Alert>
          )}

          {/* Export Progress */}
          {isExporting && progress && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">Generating CSV file...</span>
              </div>
              <Progress value={progressPercentage} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {progress.current.toLocaleString()} / {progress.total.toLocaleString()} records processed
                </span>
                <span>{progressPercentage}%</span>
              </div>
            </div>
          )}

          {/* Export Statistics */}
          {!isExporting && !success && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Records to Export</div>
                  <div className="text-2xl font-bold">{stats.filteredRecords.toLocaleString()}</div>
                  {stats.filteredRecords !== stats.totalRecords && (
                    <div className="text-xs text-muted-foreground">of {stats.totalRecords.toLocaleString()} total</div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Total Columns</div>
                  <div className="text-2xl font-bold">{stats.totalColumns}</div>
                  {stats.customColumns > 0 && (
                    <div className="text-xs text-muted-foreground">{stats.customColumns} custom columns</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Estimated File Size</div>
                <Badge variant="secondary" className="text-sm">
                  {stats.estimatedFileSize}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-2">What will be exported:</p>
                <ul className="text-xs space-y-1">
                  <li>• All Pokemon data including sprites, stats, and types</li>
                  <li>• All custom columns you've created</li>
                  <li>• Current edited values from the table</li>
                  <li>• Only the filtered/searched records (if any filters are active)</li>
                  <li>• CSV format compatible with Excel, Google Sheets, and other tools</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isExporting}>
            {success ? "Close" : "Cancel"}
          </Button>
          {!success && (
            <Button onClick={handleExport} disabled={isExporting || stats.filteredRecords === 0}>
              {isExporting ? (
                <>
                  <Download className="mr-2 h-4 w-4 animate-pulse" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {stats.filteredRecords.toLocaleString()} Records
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
