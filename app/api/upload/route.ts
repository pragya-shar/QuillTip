import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed image MIME types (official MIME types only)
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]

// Allowed file extensions (for double validation)
const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg', 
  'png',
  'webp',
  'gif'
]

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse JSON body (file metadata for presigned URL generation)
    let body: { fileName?: string; fileType?: string; fileSize?: number }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    const { fileName, fileType, fileSize } = body
    
    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing file metadata (fileName, fileType, fileSize)' },
        { status: 400 }
      )
    }

    // Validate fileName
    if (typeof fileName !== 'string' || fileName.length === 0) {
      return NextResponse.json(
        { error: 'Invalid filename.' },
        { status: 400 }
      )
    }

    if (fileName.length > 255) {
      return NextResponse.json(
        { error: 'Filename too long. Maximum 255 characters.' },
        { status: 400 }
      )
    }

    // Check for dangerous characters in filename
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/
    if (dangerousChars.test(fileName)) {
      return NextResponse.json(
        { error: 'Filename contains invalid characters.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Double-check: validate file extension 
    const submittedExtension = fileName.toLowerCase().split('.').pop()
    if (!submittedExtension || !ALLOWED_EXTENSIONS.includes(submittedExtension)) {
      return NextResponse.json(
        { error: 'Invalid file extension. Only image files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (typeof fileSize !== 'number' || isNaN(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { error: 'Invalid file size.' },
        { status: 400 }
      )
    }
    
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : 'bin'
    if (!fileExtension) {
      return NextResponse.json(
        { error: 'Invalid filename - no extension found' },
        { status: 400 }
      )
    }
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2)
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`
    const filePath = `uploads/${session.user.id}/${uniqueFileName}`

    // Generate presigned URL for client-side upload
    const { data, error } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET!)
      .createSignedUploadUrl(filePath, {
        upsert: false
      })

    if (error) {
      console.error('Presigned URL generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      )
    }

    // Get future public URL (will be available after client uploads)
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET!)
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      uploadUrl: data.signedUrl,
      publicUrl: publicUrl,
      filePath: filePath,
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileType
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}