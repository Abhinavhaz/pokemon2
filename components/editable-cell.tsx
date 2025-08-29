"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

interface EditableCellProps {
  value: any
  onSave: (value: any) => void
  type?: "string" | "number" | "array"
  className?: string
}

export function EditableCell({ value, onSave, type = "string", className = "" }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    let processedValue = editValue

    if (type === "number") {
      processedValue = Number.parseFloat(editValue) || 0
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
    return (
      <div className="flex items-center gap-1">
        <Input
          value={type === "array" && Array.isArray(editValue) ? editValue.join(", ") : editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-xs"
          autoFocus
        />
        <button onClick={handleSave} className="p-1 hover:bg-green-100 rounded text-green-600" title="Save">
          <Check className="h-3 w-3" />
        </button>
        <button onClick={handleCancel} className="p-1 hover:bg-red-100 rounded text-red-600" title="Cancel">
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

  return (
    <div
      className={`cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[2rem] flex items-center ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {displayValue()}
    </div>
  )
}
