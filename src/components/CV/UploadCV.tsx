import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ParsedCV } from '@/lib/pdf/types';
import { CVViewer } from './CVViewer';
import { CVEditor } from './CVEditor';

interface UploadCVProps {
  onProcessed: (data: ParsedCV) => void;
}

export function UploadCV({ onProcessed }: UploadCVProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [cvSource, setCvSource] = React.useState<'upload' | 'sample'>('upload');
  const [processedCV, setProcessedCV] = React.useState<ParsedCV | null>(null);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      // Reset processed CV when new file is selected
      setProcessedCV(null);
    } else {
      setError('Please upload a PDF file');
      setFile(null);
    }
  };

  const handleProcess = async () => {
    if (!file && cvSource === 'upload') {
      setError('Please select a file');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setProgress(0);
      setProgressMessage('Starting...');

      const formData = new FormData();
      if (cvSource === 'sample') {
        formData.append('useSample', 'true');
      } else {
        formData.append('cv', file!);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVICE_URL}/apis/cv/process`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.done) {
              if (data.success) {
                setProgress(100);
                setProgressMessage('Processing complete! Opening CV viewer...');
                // Add a delay before showing the CV viewer
                await new Promise((resolve) => setTimeout(resolve, 1500));
                setProcessedCV(data.data);
                onProcessed(data.data);
                setIsViewerOpen(true);
              }
              break;
            } else {
              setProgress(data.percentage);
              setProgressMessage(data.message);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewerClose = () => {
    setIsViewerOpen(false);
    setProcessedCV(null);
    handleReset();
  };

  const handleReset = () => {
    setFile(null);
    setProcessedCV(null);
    setError(null);
    setProgress(0);
    setCvSource('upload');
  };

  const handleEdit = (cv: ParsedCV) => {
    setIsViewerOpen(false);
    setIsEditing(true);
  };

  const handleSaveEdit = (updatedCV: ParsedCV) => {
    setProcessedCV(updatedCV);
    setIsEditing(false);
    setIsViewerOpen(true);
    onProcessed(updatedCV);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsViewerOpen(true);
  };

  return (
    <>
      {!processedCV && !isEditing && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Upload CV</CardTitle>
            <CardDescription>
              Upload your CV for anonymization and formatting, or use our sample
              CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Select CV Source</Label>
                <Select
                  value={cvSource}
                  onValueChange={(value: 'upload' | 'sample') => {
                    setCvSource(value);
                    setFile(null);
                    setError(null);
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

              {cvSource === 'upload' && (
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
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  {progressMessage}
                </p>
              </div>
            )}

            {!processedCV && (
              <Button
                onClick={handleProcess}
                disabled={isProcessing || (cvSource === 'upload' && !file)}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Process CV'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {processedCV && (
        <CVViewer
          data={processedCV}
          isOpen={isViewerOpen}
          onClose={handleViewerClose}
          onEdit={handleEdit}
        />
      )}

      {isEditing && processedCV && (
        <CVEditor
          initialCV={processedCV}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </>
  );
}
