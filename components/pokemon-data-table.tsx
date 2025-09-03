"use client"

import { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Settings } from "lucide-react"
import { usePokemonStore } from "@/lib/store"
import { EditableCell } from "./editable-cell"
import { PokemonSprite } from "./pokemon-sprite"
import { AddColumnDialog } from "./add-column-dialog"
import { ColumnManager } from "./column-manager"
import { ExportDialog } from "./export-dialog"
import { AIChatOverlay } from "./ai-chat-overlay"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Pokemon } from "@/lib/types"

export function PokemonDataTable() {
  const { pokemon, updatePokemon, customColumns } = usePokemonStore()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)

  const parentRef = useRef<HTMLDivElement>(null)

  // Define table columns
  const columns = useMemo<ColumnDef<Pokemon>[]>(() => {
    const baseColumns: ColumnDef<Pokemon>[] = [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-medium"
          >
            Id
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            onSave={(value) => updatePokemon(row.original.id, { id: value })}
            type="number"
            className="font-mono text-sm"
          />
        ),
        size: 80,
      },
      {
        accessorKey: "sprite",
        header: "Sprite",
        cell: ({ row }) => <PokemonSprite src={row.original.sprite} alt={row.original.name} size={40} />,
        enableSorting: false,
        size: 60,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-medium"
          >
            Name
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            onSave={(value) => updatePokemon(row.original.id, { name: value })}
            type="string"
            className="font-medium overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-button]:hidden"
          />
        ),
        size: 120,
      },
      {
        accessorKey: "types",
        header: "Types",
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            onSave={(value) => updatePokemon(row.original.id, { types: value })}
            type="array"
            className="font-medium overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-button]:hidden"
          />
        ),
        enableSorting: false,
        size: 140,
      },
      {
        accessorKey: "hp",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-medium"
          >
            HP
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            onSave={(value) => updatePokemon(row.original.id, { hp: value })}
            type="number"
            className="font-mono text-center"
            readonly={false}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "attack",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-medium"
          >
            Attack
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            onSave={(value) => updatePokemon(row.original.id, { attack: value })}
            type="number"
            className="font-mono text-center"
            readonly={false}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "defense",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-medium"
          >
            Defense
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            onSave={(value) => updatePokemon(row.original.id, { defense: value })}
            type="number"
            className="font-mono text-center"
            readonly={false}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "specialAttack",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-medium"
          >
            Sp. Atk
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            onSave={(value) => updatePokemon(row.original.id, { specialAttack: value })}
            type="number"
            className="font-mono text-center"
            readonly={false}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "specialDefense",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-medium"
          >
            Sp. Def
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            onSave={(value) => updatePokemon(row.original.id, { specialDefense: value })}
            type="number"
            className="font-mono text-center"
            readonly={false}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "speed",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 text-xs font-medium"
          >
            Speed
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3" />
            )}
          </Button>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            value={getValue()}
            onSave={(value) => updatePokemon(row.original.id, { speed: value })}
            type="number"
            className="font-mono text-center"
            readonly={false}
          />
        ),
        size: 120,
      },
    ]

    // Add custom columns
         const dynamicColumns: ColumnDef<Pokemon>[] = customColumns.map((customCol) => ({
       id: customCol.id,
       accessorKey: customCol.id,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 text-xs font-medium"
        >
          {customCol.name}
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-1 h-3 w-3" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3" />
          )}
        </Button>
      ),
             cell: ({ row, getValue }) => {
         const cellValue = row.original[customCol.id] ?? customCol.defaultValue
         return (
           <EditableCell
             value={cellValue}
             onSave={(value) => updatePokemon(row.original.id, { [customCol.id]: value })}
             type={customCol.type === "text" ? "string" : customCol.type === "number" ? "number" : customCol.type === "boolean" ? "boolean" : "string"}
           />
         )
       },
      size: 120,
    }))

    const addColumnColumn: ColumnDef<Pokemon> = {
      id: "add-column",
      header: () => <AddColumnDialog />,
      cell: () => <div className="w-full h-8" />,
      enableSorting: false,
      size: 100,
    }

    return [...baseColumns, ...dynamicColumns, addColumnColumn]
  }, [customColumns, updatePokemon])

  // Guard against stale sorting/filter state when columns change (e.g., custom columns removed)
  const validColumnIdSet = useMemo(() => {
    const ids = new Set<string>()
    columns.forEach((col) => {
      const id = (col as any).id ?? (col as any).accessorKey
      if (typeof id === "string" && id.length > 0) ids.add(id)
    })
    return ids
  }, [columns])

  const safeSorting = useMemo(() => sorting.filter((s) => validColumnIdSet.has(s.id)), [sorting, validColumnIdSet])
  const safeColumnFilters = useMemo(
    () => columnFilters.filter((f) => validColumnIdSet.has(f.id as string)),
    [columnFilters, validColumnIdSet],
  )

  const table = useReactTable({
    data: pokemon,
    columns,
    state: {
      sorting: safeSorting,
      columnFilters: safeColumnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const { rows } = table.getRowModel()

  // Calculate total table width based on all columns
  const totalTableWidth = useMemo(() => {
    return table.getAllColumns().reduce((total, column) => total + column.getSize(), 0)
  }, [table.getAllColumns()])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  })

  if (pokemon.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No Pokemon data loaded. Please fetch data from the Data Sources tab.</p>
      </div>
    )
  }

  // Get filtered Pokemon data for export
  const filteredPokemon = rows.map((row) => row.original)

  return (
    <div className="space-y-4 relative">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Pokemon..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Showing {rows.length.toLocaleString()} of {pokemon.length.toLocaleString()} Pokemon
          {totalTableWidth > 720 && (
            <div className="text-xs text-blue-600 mt-1">
              ← Scroll horizontally to see all columns →
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <ExportDialog filteredPokemon={filteredPokemon} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage Columns
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Column Management</SheetTitle>
                <SheetDescription>Add, remove, and manage custom columns for your Pokemon dataset.</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ColumnManager />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Virtualized Table */}
      <div
        ref={parentRef}
        className="h-[60vh] sm:h-[600px] overflow-auto border rounded-lg"
        style={{
          contain: "strict",
        }}
      >
        <div style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: Math.max(totalTableWidth, 720),
          minWidth: Math.max(totalTableWidth, 720),
          position: "relative"
        }}>
          {/* Table Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className="flex" style={{ minWidth: Math.max(totalTableWidth, 720) }}>
                {headerGroup.headers.map((header, index) => {
                  const isFirstColumn = index === 0
                  const isLastColumn = index === headerGroup.headers.length - 1
                  return (
                    <div
                      key={header.id}
                      className={`border-r last:border-r-0 bg-muted/50 ${
                        isFirstColumn || isLastColumn ? "sticky z-20 bg-background" : ""
                      } ${isFirstColumn ? "left-0" : ""} ${isLastColumn ? "right-0" : ""}`}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Virtual Rows */}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            return (
              <div
                key={row.id}
                className="absolute flex hover:bg-muted/30"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  width: Math.max(totalTableWidth, 720),
                  minWidth: Math.max(totalTableWidth, 720),
                }}
              >
                {row.getVisibleCells().map((cell, index) => {
                  const isFirstColumn = index === 0
                  const isLastColumn = index === row.getVisibleCells().length - 1
                  return (
                    <div
                      key={cell.id}
                      className={`border-r last:border-r-0 border-b flex items-center px-2 ${
                        isFirstColumn || isLastColumn ? "sticky z-10 bg-background" : ""
                      } ${isFirstColumn ? "left-0" : ""} ${isLastColumn ? "right-0" : ""}`}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Table Info */}
      <div className="px-4 sm:px-6 py-2 text-xs sm:text-sm text-muted-foreground border-t">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
          <span>
            {pokemon.length.toLocaleString()} total Pokemon • {customColumns.length} custom columns
          </span>
          <span>Scroll to see more data • Click cells to edit</span>
        </div>
      </div>

      {/* AI Chat Overlay */}
      <AIChatOverlay isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
    </div>
  )
}
