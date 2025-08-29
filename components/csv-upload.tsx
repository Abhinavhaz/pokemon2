"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText } from "lucide-react"
import { parseCSVFile } from "@/lib/csv-utils"

interface CSVUploadProps {
  onFileProcessed: (data: any[], headers: string[], fileName: string) => void
  onError: (error: string) => void
}

export function CSVUpload({ onFileProcessed, onError }: CSVUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
        onError("Please select a valid CSV file")
        return
      }

      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        onError("File size must be less than 100MB")
        return
      }

      setSelectedFile(file)
      setIsProcessing(true)
      setProgress({ current: 0, total: 100 })

      parseCSVFile(
        file,
        (progress) => setProgress(progress),
        (data, headers) => {
          setIsProcessing(false)
          setProgress(null)
          onFileProcessed(data, headers, file.name)
        },
        (error) => {
          setIsProcessing(false)
          setProgress(null)
          setSelectedFile(null)
          onError(error)
        },
      )
    },
    [onFileProcessed, onError],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  const progressPercentage = progress ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          CSV File Upload
        </CardTitle>
        <CardDescription>Upload your own Pokemon dataset from a CSV file (up to 100MB)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors relative ${
            isDragOver
              ? "border-primary bg-primary/5"
              : isProcessing
                ? "border-muted bg-muted/20"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Processing {selectedFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Parsing CSV data with streaming for optimal performance...
                </p>
              </div>
              {progress && (
                <div className="space-y-2 max-w-md mx-auto">
                  <Progress value={progressPercentage} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {progress.current.toLocaleString()} / {progress.total.toLocaleString()} rows
                    </span>
                    <span>{progressPercentage}%</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">or click to browse files</p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
            </div>
          )}
        </div>

        {/* File Requirements */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Supported format: CSV files only</p>
          <p>• Maximum file size: 100MB</p>
          <p>• First row should contain column headers</p>
          <p>• Large files are processed with streaming to prevent browser crashes</p>
        </div>
      </CardContent>
    </Card>
  )
}
