import React, { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, Eye, Trash2, Edit3, Download } from 'lucide-react'
import useEditorStore from '../../stores/editorStore'
import editorManager from '../../utils/editorManager'

interface ImageItem {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadDate: Date
}

const ImageManager: React.FC = () => {
  const { uploadedImages, addUploadedImage, removeUploadedImage } = useEditorStore()
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList) => {
    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        const newImage: ImageItem = {
          id: Date.now().toString() + i,
          name: file.name,
          url,
          size: file.size,
          type: file.type,
          uploadDate: new Date()
        }
        addUploadedImage(newImage)
      }
    }

    setIsUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDeleteImage = (id: string) => {
    removeUploadedImage(id)
    if (selectedImage?.id === id) {
      setSelectedImage(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const insertImageToEditor = async (image: ImageItem) => {
    try {
      // 使用编辑器管理器插入图片
      await editorManager.insertImage(image.url, image.name)
      showNotification('✅', '图片已插入到编辑器', '#07C160')
    } catch (error) {
      console.error('插入图片失败:', error)

      // 降级方案：直接操作DOM
      try {
        const quillEditor = document.querySelector('.ql-editor')
        if (quillEditor) {
          // 创建图片元素
          const imgElement = document.createElement('img')
          imgElement.src = image.url
          imgElement.alt = image.name
          imgElement.setAttribute('data-image-id', image.id)
          imgElement.style.cssText = `
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 10px 0;
            display: block;
            margin-left: auto;
            margin-right: auto;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          `

          // 创建包装div
          const wrapperDiv = document.createElement('div')
          wrapperDiv.style.cssText = `
            margin: 15px 0;
            text-align: center;
          `
          wrapperDiv.appendChild(imgElement)

          // 插入到编辑器末尾
          quillEditor.appendChild(wrapperDiv)

          // 滚动到插入的图片位置
          imgElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

          showNotification('✅', '图片已插入到编辑器', '#07C160')
        } else {
          throw new Error('编辑器未找到')
        }
      } catch (fallbackError) {
        console.error('降级方案也失败:', fallbackError)
        showNotification('❌', '插入图片失败，请重试', '#DC2626')
      }
    }
  }

  const showNotification = (icon: string, message: string, color: string) => {
    const notification = document.createElement('div')
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: ${color};">${icon}</span>
        <span>${message}</span>
      </div>
    `
    notification.className = 'fixed top-4 right-4 bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border z-50'
    notification.style.animation = 'slideInRight 0.3s ease-out'
    document.body.appendChild(notification)

    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOutRight 0.3s ease-in'
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* 上传区域 */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <p className="text-gray-600">拖拽图片到此处或点击上传</p>
            <p className="text-sm text-gray-400">支持 JPG、PNG、GIF 格式，最大 5MB</p>
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
            选择文件
          </button>
        </div>
      </div>

      {/* 图片库 */}
      {uploadedImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">图片库 ({uploadedImages.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group border border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 悬停操作按钮 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="预览"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertImageToEditor(image)}
                      className="bg-primary text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                      title="插入到编辑器"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 图片信息 */}
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate" title={image.name}>
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedImage.name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(selectedImage.size)} • {selectedImage.type}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => insertImageToEditor(selectedImage)}
                    className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    插入编辑器
                  </button>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="max-w-full max-h-96 mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {uploadedImages.length === 0 && !isUploading && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">还没有上传任何图片</p>
          <p className="text-sm text-gray-400">上传图片后可以在这里管理和使用</p>
        </div>
      )}
    </div>
  )
}

export default ImageManager
