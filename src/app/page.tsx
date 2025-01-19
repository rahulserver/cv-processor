'use client'

import { UploadCV } from '@/components/CV/UploadCV'

export default function Home() {
  const handleProcessed = (data: any) => {
    console.log('Processed CV data:', data)
    // We'll handle the processed data in the next step
  }

  return (
    <main className="container mx-auto py-10">
      <UploadCV onProcessed={handleProcessed} />
    </main>
  )
}