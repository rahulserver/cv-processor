import React from 'react'
import { Upload, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface UploadCVProps {
  onProcessed: (data: any) => void
}

export function UploadCV({ onProcessed }: UploadCVProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [cvSource, setCvSource] = React.useState<"upload" | "sample">("upload")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please upload a PDF file')
      setFile(null)
    }
  }

  const handleProcess = async () => {
    if (!file && cvSource === "upload") {
      setError('Please select a file')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setProgress(20)

      const formData = new FormData()
      if (cvSource === "sample") {
        formData.append('useSample', 'true')
      } else {
        formData.append('cv', file!)
      }

      const response = await fetch('/api/process-cv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process CV')
      }

      setProgress(100)
      const result = await response.json()
      onProcessed(result.data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload CV</CardTitle>
        <CardDescription>
          Upload your CV for anonymization and formatting, or use our sample CV
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select CV Source</Label>
            <Select
              value={cvSource}
              onValueChange={(value: "upload" | "sample") => {
                setCvSource(value)
                setFile(null)
                setError(null)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select CV source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upload">Upload My CV</SelectItem>
                <SelectItem value="sample">Use Sample CV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cvSource === "upload" && (
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-muted-foreground" />
                <span className="mt-2 text-sm text-muted-foreground">
                  Drop your CV here or click to upload
                </span>
              </label>
            </div>
          )}

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Processing your CV...
              </p>
            </div>
          )}

          <Button
            onClick={handleProcess}
            disabled={isProcessing || (cvSource === "upload" && !file)}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Process CV'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}