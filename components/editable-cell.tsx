"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

interface EditableCellProps {
  value: any
  onSave: (value: any) => void
  type?: "string" | "number" | "array"
  className?: string
  readonly?: boolean
}

export function EditableCell({ value, onSave, type = "string", className = "", readonly = false }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    let processedValue = editValue

    if (type === "number") {
      const numValue = Number.parseFloat(String(editValue))
      processedValue = isNaN(numValue) ? 0 : numValue
    } else if (type === "array") {
      if (typeof editValue === "string") {
        processedValue = editValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      }
    }

    onSave(processedValue)
    setIsEditing(false)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Don't save if clicking on save/cancel buttons
    const relatedTarget = e.relatedTarget as HTMLElement
    if (relatedTarget && relatedTarget.closest('button')) {
      return
    }
    handleSave()
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    const inputValue = type === "array" && Array.isArray(editValue)
      ? editValue.join(", ")
      : String(editValue ?? "")

    return (
      <div className="flex items-center gap-1 w-full max-w-full">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 min-w-0 h-6 text-xs px-1 border border-input bg-background rounded focus:outline-none focus:ring-1 focus:ring-ring"
          type="text"
          autoComplete="off"
        />
        <button
          onClick={handleSave}
          onMouseDown={(e) => e.preventDefault()}
          className="flex-shrink-0 p-0.5 hover:bg-green-100 rounded text-green-600"
          title="Save"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={handleCancel}
          onMouseDown={(e) => e.preventDefault()}
          className="flex-shrink-0 p-0.5 hover:bg-red-100 rounded text-red-600"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  const displayValue = () => {
    if (type === "array" && Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {item}
            </Badge>
          ))}
        </div>
      )
    }
    return value?.toString() || ""
  }

  const handleClick = () => {
    if (!readonly) {
      setIsEditing(true)
    }
  }

  return (
    <div
      className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50'} p-1 rounded min-h-[2rem] flex items-center w-full max-w-full overflow-hidden ${className}`}
      onClick={handleClick}
      title={readonly ? "Read-only field" : "Click to edit"}
    >
      {displayValue()}
    </div>
  )
}
