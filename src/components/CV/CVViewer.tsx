import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ParsedCV } from '@/lib/pdf/types';
import { Download } from 'lucide-react';

interface CVViewerProps {
  data: ParsedCV;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (cv: ParsedCV) => void;
}

export function CVViewer({ data, isOpen, onClose, onEdit }: CVViewerProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cv.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex justify-between">
            <span>Processed CV</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => onEdit(data)}>Edit CV</Button>
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription>
            PII removed: {data.piiRemoved?.join(', ')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            <Card className="w-full max-w-4xl mx-auto">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2>{data?.firstName || 'Name'}</h2>
                  <hr className="my-2" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Summary</h2>
                  <p className="text-gray-700">{data?.objective || ''}</p>
                </div>

                {data?.skills && Object.keys(data.skills).length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Skills</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      {Object.entries(data.skills).map(([category, skills]) => (
                        <li key={category}>
                          <strong>{category}</strong>: {skills}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data?.experience && data.experience.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Experience</h2>
                    <div className="space-y-4">
                      {data.experience.map((exp, index) => (
                        <div key={index}>
                          <p className="font-semibold">{exp.position}</p>
                          <p className="text-gray-600">
                            {exp.company} | {exp.period}
                          </p>
                          {exp.responsibilities &&
                            exp.responsibilities.length > 0 && (
                              <ul className="list-disc pl-6 mt-2">
                                {exp.responsibilities.map((resp, respIndex) => (
                                  <li key={respIndex}>{resp}</li>
                                ))}
                              </ul>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data?.education && data.education.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Education</h2>
                    <div className="space-y-2">
                      {data.education.map((edu, index) => (
                        <div key={index}>
                          <p className="font-semibold">{edu.qualification}</p>
                          <p className="text-gray-600">
                            {edu.institution} - {edu.completionDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data?.recruiterDetails && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      Recruiter Details
                    </h2>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {data.recruiterDetails}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formatting Notes */}
            {(data?.formattingNotes || []).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Formatting Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {data.formattingNotes.map((note, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {note}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </AlertDialogContent>
    </AlertDialog>
  );
}
