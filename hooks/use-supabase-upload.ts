'use client'

import { createClient } from '@/utils/supabase/client'
import { useCallback, useRef, useState } from 'react'
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone'

/**
 * File type with preview URL and errors
 */
export type FileWithPreview = File & {
  preview: string
  errors: { code: string; message: string }[]
}

/**
 * Configuration options for Supabase file upload
 */
export type UseSupabaseUploadOptions = {
  bucketName: string // The Supabase Storage bucket name
  path?: string // Optional path/folder within the bucket
  allowedMimeTypes?: string[] // Allowed MIME types (e.g., ['image/*', 'application/pdf'])
  maxFiles?: number // Maximum number of files to upload
  maxFileSize?: number // Maximum file size in bytes
  onUploadComplete?: (files: { name: string; path: string; url: string }[]) => void // Callback after successful upload
  onUploadError?: (error: string) => void // Callback on upload error
}

/**
 * Return type of the useSupabaseUpload hook
 */
export type UseSupabaseUploadReturn = {
  files: FileWithPreview[] // Currently selected files
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>> // Set files manually
  onUpload: () => Promise<void> // Trigger upload to Supabase
  loading: boolean // Upload in progress
  successes: string[] // Successfully uploaded file names
  errors: { name: string; message: string }[] // Upload errors per file
  isSuccess: boolean // All files uploaded successfully
  isDragActive: boolean // Files are being dragged over dropzone
  isDragReject: boolean // Dragged files are invalid
  getRootProps: () => any // Props for dropzone root element
  getInputProps: () => any // Props for file input element
  inputRef: React.RefObject<HTMLInputElement | null> // Reference to the file input
  maxFiles: number // Maximum files allowed
  maxFileSize: number // Maximum file size allowed
}

/**
 * Custom hook for uploading files to Supabase Storage with drag-and-drop support
 * 
 * Features:
 * - Drag and drop file upload
 * - File validation (type, size, count)
 * - Preview generation for images
 * - Progress tracking
 * - Error handling
 * 
 * @param options - Configuration options for upload
 * @returns Upload state and handlers
 */
export const useSupabaseUpload = (
  options: UseSupabaseUploadOptions
): UseSupabaseUploadReturn => {
  const {
    bucketName,
    path = '',
    allowedMimeTypes = [],
    maxFiles = 1,
    maxFileSize = Number.POSITIVE_INFINITY,
    onUploadComplete,
    onUploadError,
  } = options

  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement | null>(null)

  // State management for upload process
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [loading, setLoading] = useState(false)
  const [successes, setSuccesses] = useState<string[]>([])
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([])
  const [isSuccess, setIsSuccess] = useState(false)

  /**
   * Handles file drop and selection
   * Validates files and creates preview URLs for images
   */
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Reset previous state
      setIsSuccess(false)
      setSuccesses([])
      setErrors([])

      // Process accepted files
      const filesWithPreview = acceptedFiles.map((file) => {
        const fileWithPreview = Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
          errors: [],
        }) as FileWithPreview
        return fileWithPreview
      })

      // Process rejected files
      const rejectedFilesWithErrors = fileRejections.map((rejection) => {
        const fileWithPreview = Object.assign(rejection.file, {
          preview: rejection.file.type.startsWith('image/')
            ? URL.createObjectURL(rejection.file)
            : '',
          errors: rejection.errors,
        }) as FileWithPreview
        return fileWithPreview
      })

      // Combine all files
      setFiles([...filesWithPreview, ...rejectedFilesWithErrors])
    },
    []
  )

  // Convert allowed MIME types to Accept object format
  const accept: Accept = allowedMimeTypes.reduce((acc, mimeType) => {
    acc[mimeType] = []
    return acc
  }, {} as Accept)

  // Configure react-dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: allowedMimeTypes.length > 0 ? accept : undefined,
    maxFiles,
    maxSize: maxFileSize,
    multiple: maxFiles > 1,
  })

  /**
   * Uploads all valid files to Supabase Storage
   * Handles errors per file and tracks success/failure
   */
  const onUpload = useCallback(async () => {
    // Filter out files with validation errors
    const validFiles = files.filter((file) => file.errors.length === 0)
    if (validFiles.length === 0) return

    setLoading(true)
    setErrors([])
    setSuccesses([])

    const uploadPromises = validFiles.map(async (file) => {
      try {
        // Generate unique file path
        const timestamp = Date.now()
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = path
          ? `${path}/${timestamp}-${sanitizedFileName}`
          : `${timestamp}-${sanitizedFileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) {
          throw new Error(error.message)
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(data.path)

        return {
          name: file.name,
          path: data.path,
          url: publicUrl,
        }
      } catch (error) {
        // Track individual file errors
        setErrors((prev) => [
          ...prev,
          {
            name: file.name,
            message: error instanceof Error ? error.message : 'Upload failed',
          },
        ])
        return null
      }
    })

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter((r) => r !== null) as {
      name: string
      path: string
      url: string
    }[]

    // Update success tracking
    setSuccesses(successfulUploads.map((r) => r.name))
    setLoading(false)

    // Check if all uploads succeeded
    if (successfulUploads.length === validFiles.length) {
      setIsSuccess(true)
      onUploadComplete?.(successfulUploads)
    } else if (successfulUploads.length === 0) {
      onUploadError?.('All uploads failed')
    }
  }, [files, bucketName, path, supabase, onUploadComplete, onUploadError])

  return {
    files,
    setFiles,
    onUpload,
    loading,
    successes,
    errors,
    isSuccess,
    isDragActive,
    isDragReject,
    getRootProps,
    getInputProps,
    inputRef: inputRef as React.RefObject<HTMLInputElement | null>,
    maxFiles,
    maxFileSize,
  }
}

