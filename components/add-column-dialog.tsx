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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertCircle } from "lucide-react"
import { usePokemonStore } from "@/lib/store"
import type { CustomColumn } from "@/lib/types"

interface AddColumnDialogProps {
  trigger?: React.ReactNode
}

export function AddColumnDialog({ trigger }: AddColumnDialogProps) {
  const [open, setOpen] = useState(false)
  const [columnName, setColumnName] = useState("")
  const [columnType, setColumnType] = useState<"text" | "number" | "boolean">("text")
  const [error, setError] = useState<string | null>(null)
  const { addCustomColumn, customColumns, pokemon } = usePokemonStore()

  const handleSubmit = () => {
    setError(null)

    // Validation
    if (!columnName.trim()) {
      setError("Column name is required")
      return
    }

    if (columnName.trim().length < 2) {
      setError("Column name must be at least 2 characters long")
      return
    }

    if (columnName.trim().length > 50) {
      setError("Column name must be less than 50 characters")
      return
    }

    // Check for duplicate names (case insensitive)
    const normalizedName = columnName.trim().toLowerCase()
    const existingNames = customColumns.map((col) => col.name.toLowerCase())

    // Also check against built-in Pokemon fields
    const builtInFields = [
      "id",
      "name",
      "sprite",
      "types",
      "hp",
      "attack",
      "defense",
      "specialattack",
      "specialdefense",
      "speed",
      "height",
      "weight",
      "baseexperience",
    ]

    if (existingNames.includes(normalizedName) || builtInFields.includes(normalizedName)) {
      setError("A column with this name already exists")
      return
    }

    // Generate unique ID for the column
    const columnId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Determine default value based on type
    let defaultValue: string | number | boolean
    switch (columnType) {
      case "text":
        defaultValue = ""
        break
      case "number":
        defaultValue = 0
        break
      case "boolean":
        defaultValue = false
        break
    }

    const newColumn: CustomColumn = {
      id: columnId,
      name: columnName.trim(),
      type: columnType,
      defaultValue,
    }

    addCustomColumn(newColumn)

    // Reset form and close dialog
    setColumnName("")
    setColumnType("text")
    setError(null)
    setOpen(false)
  }

  const handleCancel = () => {
    setColumnName("")
    setColumnType("text")
    setError(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Column
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Column</DialogTitle>
          <DialogDescription>
            Create a new column that will be added to all Pokemon records. You can edit the values for each Pokemon
            directly in the table.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Column Name */}
          <div className="space-y-2">
            <Label htmlFor="column-name">Column Name</Label>
            <Input
              id="column-name"
              placeholder="Enter column name..."
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">This will appear as the column header in the table</p>
          </div>

          {/* Column Type */}
          <div className="space-y-2">
            <Label htmlFor="column-type">Data Type</Label>
            <Select value={columnType} onValueChange={(value: "text" | "number" | "boolean") => setColumnType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Text</span>
                    <span className="text-xs text-muted-foreground">String values (default: empty)</span>
                  </div>
                </SelectItem>
                <SelectItem value="number">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Number</span>
                    <span className="text-xs text-muted-foreground">Numeric values (default: 0)</span>
                  </div>
                </SelectItem>
                <SelectItem value="boolean">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Boolean</span>
                    <span className="text-xs text-muted-foreground">True/false values (default: false)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">What happens next:</p>
            <ul className="text-xs space-y-1">
              <li>• The column will be added to all {pokemon.length.toLocaleString()} Pokemon records</li>
              <li>• Each record will get the default value for this column</li>
              <li>• You can edit individual values directly in the table</li>
              <li>• The column will be included in data exports</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!columnName.trim()}>
            Add Column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
