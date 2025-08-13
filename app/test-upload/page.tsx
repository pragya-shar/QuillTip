'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function TestUploadPage() {
  const { data: session, status } = useSession()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    publicUrl: string
    fileName: string
    fileSize: number
    fileType: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !session) return

    setUploading(true)
    setError(null)

    try {
      // Step 1: Get presigned URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get upload URL')
      }

      // Step 2: Upload file to Supabase using presigned URL
      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        }
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage')
      }

      setResult({
        success: true,
        publicUrl: data.publicUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Upload Test</h1>
        <p>Please log in to test upload functionality.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Image Upload Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select an image file:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {selectedFile && (
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium">Selected File:</h3>
            <p>Name: {selectedFile.name}</p>
            <p>Type: {selectedFile.type}</p>
            <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <h3 className="font-medium mb-2">Upload Successful!</h3>
            <p><strong>File:</strong> {result.fileName}</p>
            <p><strong>Size:</strong> {(result.fileSize / 1024).toFixed(2)} KB</p>
            <p><strong>Type:</strong> {result.fileType}</p>
            <p><strong>Public URL:</strong></p>
            <a 
              href={result.publicUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {result.publicUrl}
            </a>
            
            {result.fileType.startsWith('image/') && (
              <div className="mt-4">
                <p className="font-medium mb-2">Preview:</p>
                <Image 
                  src={result.publicUrl} 
                  alt="Uploaded"
                  width={400}
                  height={256}
                  className="max-w-md max-h-64 border rounded object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}