import React from 'react'
import { Edit3, Image, Palette, Folder, History, Settings } from 'lucide-react'
import ImageUpload from '../ImageProcessor/ImageUpload'
import useEditorStore from '../../stores/editorStore'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const {
    title,
    author,
    coverImage,
    uploadedImages,
    setTitle,
    setAuthor,
    setCoverImage,
    addUploadedImage,
    removeUploadedImage
  } = useEditorStore()

  const navigationItems = [
    { id: 'editor', icon: Edit3, text: '编辑文章' },
    { id: 'images', icon: Image, text: '图片管理' },
    { id: 'styles', icon: Palette, text: '样式设置' },
    { id: 'topics', icon: Folder, text: '专题管理' },
    { id: 'history', icon: History, text: '历史版本' },
    { id: 'settings', icon: Settings, text: '系统设置' }
  ]

  const handleImageSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setCoverImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageRemove = () => {
    setCoverImage('')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthor(e.target.value)
  }

  // 处理图片库上传
  const handleImageLibraryUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      const imageItem = {
        id: Date.now().toString(),
        name: file.name,
        url: imageUrl,
        size: file.size,
        type: file.type,
        uploadDate: new Date()
      }
      addUploadedImage(imageItem)
    }
    reader.readAsDataURL(file)
  }

  // 插入图片到编辑器
  const handleInsertImageToEditor = (imageUrl: string) => {
    // 获取Quill编辑器实例
    const quillEditor = (window as any).quillInstance
    if (quillEditor) {
      const range = quillEditor.getSelection()
      const index = range ? range.index : quillEditor.getLength()
      quillEditor.insertEmbed(index, 'image', imageUrl)
    }
  }

  // 删除图片库中的图片
  const handleRemoveImageFromLibrary = (imageId: string) => {
    if (confirm('确定要删除这张图片吗？')) {
      removeUploadedImage(imageId)
    }
  }

  return (
    <div className="w-full lg:w-sidebar flex-shrink-0">
      {/* 功能导航 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="font-semibold text-lg mb-4 text-gray-800">功能导航</h2>
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* 文章信息 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-semibold text-lg mb-4 text-gray-800">文章信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文章标题
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="输入文章标题"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文章作者
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="输入作者名称"
              value={author}
              onChange={handleAuthorChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              封面图片
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              preview={coverImage}
            />
          </div>
        </div>
      </div>

      {/* 图片库 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-gray-800">图片库</h2>
          <span className="text-sm text-gray-500">{uploadedImages.length} 张图片</span>
        </div>

        {/* 图片上传区域 */}
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleImageLibraryUpload(file)
                e.target.value = '' // 清空input
              }
            }}
            className="hidden"
            id="image-library-upload"
          />
          <label
            htmlFor="image-library-upload"
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors block"
          >
            <Image className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-600">点击上传图片</span>
          </label>
        </div>

        {/* 图片列表 */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {uploadedImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">还没有上传图片</p>
            </div>
          ) : (
            uploadedImages.map((image) => (
              <div
                key={image.id}
                className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 group"
              >
                {/* 图片缩略图 */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-12 h-12 object-cover rounded border cursor-pointer"
                  onClick={() => handleInsertImageToEditor(image.url)}
                  title="点击插入到编辑器"
                />

                {/* 图片信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(image.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleInsertImageToEditor(image.url)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="插入到编辑器"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleRemoveImageFromLibrary(image.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="删除图片"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar