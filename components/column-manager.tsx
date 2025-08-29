"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus, Columns, Info } from "lucide-react"
import { usePokemonStore } from "@/lib/store"
import { AddColumnDialog } from "./add-column-dialog"

export function ColumnManager() {
  const { customColumns, removeCustomColumn, pokemon } = usePokemonStore()

  const handleRemoveColumn = (columnId: string) => {
    if (
      confirm(
        "Are you sure you want to remove this column? This will delete the column and all its data from all Pokemon records.",
      )
    ) {
      removeCustomColumn(columnId)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Columns className="h-5 w-5" />
          Column Management
        </CardTitle>
        <CardDescription>
          Manage custom columns for your Pokemon dataset. Add new columns or remove existing ones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Column Button */}
        <AddColumnDialog
          trigger={
            <Button className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Column
            </Button>
          }
        />

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Custom columns are added to all Pokemon records and can be edited directly in the data table. They are also
            included when exporting data.
          </AlertDescription>
        </Alert>

        {/* Existing Custom Columns */}
        {customColumns.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Custom Columns ({customColumns.length})</h4>
            <div className="space-y-2">
              {customColumns.map((column) => (
                <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{column.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Default: {column.defaultValue?.toString() || "empty"}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {column.type}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveColumn(column.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Columns className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No custom columns yet</p>
            <p className="text-xs">Add your first custom column to extend the Pokemon dataset</p>
          </div>
        )}

        {/* Stats */}
        {pokemon.length > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Custom columns will be applied to all {pokemon.length.toLocaleString()} Pokemon records
          </div>
        )}
      </CardContent>
    </Card>
  )
}
