// Upload Queue Service for handling multiple concurrent uploads
class UploadQueueService {
  constructor() {
    this.queue = []
    this.processing = false
    this.maxConcurrent = 3 // Maximum 3 concurrent uploads
    this.activeUploads = 0
    this.uploadCallbacks = new Map()
  }

  // Add upload to queue
  async addToQueue(uploadData, onProgress, onSuccess, onError) {
    const uploadId = this.generateUploadId()
    
    const uploadTask = {
      id: uploadId,
      data: uploadData,
      onProgress,
      onSuccess,
      onError,
      status: 'pending',
      retries: 0,
      maxRetries: 2
    }

    this.queue.push(uploadTask)
    this.uploadCallbacks.set(uploadId, { onProgress, onSuccess, onError })
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue()
    }

    return uploadId
  }

  // Process upload queue
  async processQueue() {
    if (this.processing) return
    
    this.processing = true
    
    while (this.queue.length > 0 && this.activeUploads < this.maxConcurrent) {
      const uploadTask = this.queue.shift()
      if (uploadTask) {
        this.activeUploads++
        this.processUpload(uploadTask)
      }
    }
    
    this.processing = false
  }

  // Process individual upload
  async processUpload(uploadTask) {
    try {
      uploadTask.status = 'uploading'
      
      // Simulate upload with progress
      const result = await this.uploadWithProgress(uploadTask)
      
      uploadTask.status = 'completed'
      uploadTask.onSuccess?.(result)
      
    } catch (error) {
      uploadTask.status = 'failed'
      
      if (uploadTask.retries < uploadTask.maxRetries) {
        uploadTask.retries++
        uploadTask.status = 'retrying'
        
        // Retry after delay
        setTimeout(() => {
          this.queue.unshift(uploadTask)
          this.processQueue()
        }, 1000 * uploadTask.retries) // Exponential backoff
        
      } else {
        uploadTask.onError?.(error)
      }
    } finally {
      this.activeUploads--
      this.uploadCallbacks.delete(uploadTask.id)
      
      // Continue processing queue
      if (this.queue.length > 0) {
        this.processQueue()
      }
    }
  }

  // Upload with progress tracking
  async uploadWithProgress(uploadTask) {
    const { data, onProgress } = uploadTask
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          onProgress?.(progress)
        }
      })
      
      // Success
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (error) {
            resolve({ success: true, data: xhr.responseText })
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })
      
      // Error
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })
      
      // Timeout
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'))
      })
      
      // Configure and send
      xhr.open('POST', '/teacher/upload-photo')
      xhr.timeout = 180000 // 3 minutes
      
      // Add auth header
      const token = localStorage.getItem('token')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      
      xhr.send(data)
    })
  }

  // Get queue status
  getQueueStatus() {
    return {
      pending: this.queue.filter(u => u.status === 'pending').length,
      uploading: this.queue.filter(u => u.status === 'uploading').length,
      completed: this.queue.filter(u => u.status === 'completed').length,
      failed: this.queue.filter(u => u.status === 'failed').length,
      retrying: this.queue.filter(u => u.status === 'retrying').length,
      activeUploads: this.activeUploads,
      maxConcurrent: this.maxConcurrent
    }
  }

  // Cancel upload
  cancelUpload(uploadId) {
    const index = this.queue.findIndex(u => u.id === uploadId)
    if (index !== -1) {
      const uploadTask = this.queue.splice(index, 1)[0]
      uploadTask.onError?.(new Error('Upload cancelled'))
      this.uploadCallbacks.delete(uploadId)
    }
  }

  // Clear queue
  clearQueue() {
    this.queue.forEach(uploadTask => {
      uploadTask.onError?.(new Error('Upload cancelled'))
    })
    this.queue = []
    this.uploadCallbacks.clear()
  }

  // Generate unique upload ID
  generateUploadId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Optimize image before upload
  async optimizeImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Batch upload multiple photos
  async batchUpload(files, onProgress, onSuccess, onError) {
    const uploadPromises = files.map((file, index) => {
      return new Promise(async (resolve, reject) => {
        try {
          // Optimize image
          const optimizedBlob = await this.optimizeImage(file)
          const optimizedFile = new File([optimizedBlob], file.name, { type: 'image/jpeg' })
          
          // Create form data
          const formData = new FormData()
          formData.append('file', optimizedFile)
          
          // Add to queue
          const uploadId = await this.addToQueue(
            formData,
            (progress) => {
              onProgress?.(index, progress)
            },
            (result) => {
              resolve(result)
            },
            (error) => {
              reject(error)
            }
          )
        } catch (error) {
          reject(error)
        }
      })
    })
    
    return Promise.allSettled(uploadPromises)
  }
}

export default new UploadQueueService()
