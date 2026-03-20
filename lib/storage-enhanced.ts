import { createClient } from "@/utils/supabase/client"
import { edgeFunctions } from "@/lib/edge-functions"

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export interface StorageConfig {
  bucket: string
  maxSize: number // in bytes
  allowedTypes: string[]
}

const STORAGE_CONFIGS = {
  avatars: {
    bucket: 'avatars',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  companions: {
    bucket: 'companion-images',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
} as const

// Enhanced image upload with validation and optimization
export async function uploadImage(
  file: File,
  type: keyof typeof STORAGE_CONFIGS,
  userId?: string
): Promise<UploadResult> {
  const supabase = createClient()
  const config = STORAGE_CONFIGS[type]

  // Validate file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      url: '',
      path: '',
      error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`
    }
  }

  // Validate file size
  if (file.size > config.maxSize) {
    return {
      url: '',
      path: '',
      error: `File too large. Maximum size: ${config.maxSize / (1024 * 1024)}MB`
    }
  }

  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    let filePath: string
    if (type === 'avatars' && userId) {
      filePath = `${userId}/${fileName}`
    } else {
      filePath = fileName
    }

    const { data, error } = await supabase.storage
      .from(config.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Delete image from storage
export async function deleteImage(
  bucket: keyof typeof STORAGE_CONFIGS,
  path: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from(STORAGE_CONFIGS[bucket].bucket)
      .remove([path])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

// Upload user avatar - now uses Edge Function
export async function uploadAvatar(file: File, userId: string): Promise<UploadResult> {
  try {
    const url = await edgeFunctions.uploadAvatar(file)
    return {
      url,
      path: '', // Path is managed by Edge Function
    }
  } catch (error) {
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Get signed URL for private files (if needed)
export async function getSignedUrl(
  bucket: keyof typeof STORAGE_CONFIGS,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIGS[bucket].bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw error
    }

    return data.signedUrl
  } catch (error) {
    console.error('Signed URL error:', error)
    return null
  }
}

// List files in a directory
export async function listFiles(
  bucket: keyof typeof STORAGE_CONFIGS,
  path: string = ''
): Promise<any[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIGS[bucket].bucket)
      .list(path)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('List files error:', error)
    return []
  }
}