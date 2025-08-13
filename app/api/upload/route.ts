import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed image MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
]

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse JSON body (file metadata for presigned URL generation)
    const body = await request.json()
    const { fileName, fileType, fileSize } = body
    
    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing file metadata (fileName, fileType, fileSize)' },
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

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = fileName.split('.').pop()
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