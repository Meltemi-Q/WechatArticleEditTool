import React, { useRef, useEffect, useCallback } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import useEditorStore from '../../stores/editorStore'
import editorManager from '../../utils/editorManager'
import 'quill/dist/quill.snow.css'
import './QuillEditor.css'

// 注册自定义撤回重做按钮
const icons = Quill.import('ui/icons')
icons['undo'] = '↩️'
icons['redo'] = '↪️'

const QuillEditor: React.FC = () => {
  const { content, setContent, selectedStyle, setSelectedImageId } = useEditorStore()
  const quillRef = useRef<ReactQuill>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 处理图片上传（点击上传）
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        insertImageFile(file)
      }
    }
  }, [])

  // 处理撤回
  const handleUndo = useCallback(() => {
    const quill = quillRef.current?.getEditor()
    if (quill) {
      quill.history.undo()
    }
  }, [])

  // 处理重做
  const handleRedo = useCallback(() => {
    const quill = quillRef.current?.getEditor()
    if (quill) {
      quill.history.redo()
    }
  }, [])

  // 插入图片文件到编辑器
  const insertImageFile = useCallback(async (file: File) => {
    try {
      console.log(`正在尝试插入图片: ${file.name}, 类型: ${file.type}, 大小: ${file.size} bytes`);
      const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!supportedTypes.includes(file.type)) {
        console.warn(`不支持的图片格式: ${file.type}`);
        showNotification('⚠️', '不支持的图片格式。请使用 PNG, JPG, GIF, WebP。', '#F59E0B');
        return
      }

      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        console.warn('图片文件过大')
        showNotification('⚠️', '图片文件不能超过5MB', '#F59E0B')
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const imageUrl = e.target?.result as string
          if (!imageUrl) {
            throw new Error('图片读取失败')
          }

          // 使用编辑器管理器插入图片
          await editorManager.insertImage(imageUrl, file.name)

          // 手动触发内容更新
          const quill = quillRef.current?.getEditor()
          if (quill) {
            const newContent = quill.root.innerHTML
            setContent(newContent)
          }

          showNotification('✅', '图片插入成功', '#07C160')
          console.log('图片插入成功:', file.name)
        } catch (error) {
          console.error('插入图片失败:', error)
          showNotification('❌', '图片插入失败，请重试', '#DC2626')
        }
      }

      reader.onerror = () => {
        console.error('读取图片文件失败')
        showNotification('❌', '图片文件读取失败', '#DC2626')
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('处理图片文件失败:', error)
      showNotification('❌', '图片处理失败', '#DC2626')
    }
  }, [setContent])

  // 显示通知
  const showNotification = (icon: string, message: string, color: string) => {
    const notification = document.createElement('div')
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: ${color};">${icon}</span>
        <span>${message}</span>
      </div>
    `
    notification.className = 'fixed top-4 right-4 bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border z-50'
    document.body.appendChild(notification)

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }

  // 处理拖拽图片
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer?.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length > 0) {
      imageFiles.forEach(file => insertImageFile(file))
    }
  }, [insertImageFile])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // 应用标题样式到选中文本
  const applyTitleStyle = useCallback((styleId: string) => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return

    const range = quill.getSelection(true)
    if (!range || range.length === 0) {
      // 如果没有选中文本，在当前位置插入样式化的标题
      const index = range ? range.index : quill.getLength()

      let styleText = ''
      let format: any = {}

      switch (styleId) {
        case 'circle-number':
          styleText = '① 在这里输入标题'
          format = { 'header': 2, 'color': '#1A1A1A', 'bold': true }
          break
        case 'left-border':
          styleText = '▌ 在这里输入标题'
          format = { 'header': 2, 'color': '#1A1A1A', 'bold': true }
          break
        case 'background-block':
          styleText = '■ 在这里输入标题'
          format = { 'header': 2, 'color': '#1A1A1A', 'bold': true, 'background': '#F3F4F6' }
          break
        case 'gradient-title':
          styleText = '★ 在这里输入标题'
          format = { 'header': 2, 'color': '#7C3AED', 'bold': true }
          break
        case 'icon-title':
          styleText = '✦ 在这里输入标题'
          format = { 'header': 2, 'color': '#D97706', 'bold': true }
          break
        case 'underline-title':
          styleText = '━ 在这里输入标题'
          format = { 'header': 2, 'color': '#3730A3', 'bold': true, 'underline': true }
          break
        case 'frame-title':
          styleText = '📋 在这里输入标题'
          format = { 'header': 2, 'color': '#059669', 'bold': true }
          break
        case 'highlight-title':
          styleText = '💡 在这里输入标题'
          format = { 'header': 2, 'color': '#1F2937', 'bold': true, 'background': '#FEF3C7' }
          break
        case 'arrow-title':
          styleText = '▶ 在这里输入标题'
          format = { 'header': 2, 'color': '#DC2626', 'bold': true }
          break
        default:
          styleText = '在这里输入标题'
          format = { 'header': 2, 'bold': true }
      }

      quill.insertText(index, styleText, format)
      quill.setSelection(index, styleText.length)
    } else {
      // 如果有选中文本，应用样式到选中的文本
      let format: any = {}

      switch (styleId) {
        case 'circle-number':
          format = { 'header': 2, 'color': '#1A1A1A', 'bold': true }
          break
        case 'left-border':
          format = { 'header': 2, 'color': '#1A1A1A', 'bold': true }
          break
        case 'background-block':
          format = { 'header': 2, 'color': '#1A1A1A', 'bold': true, 'background': '#F3F4F6' }
          break
        case 'gradient-title':
          format = { 'header': 2, 'color': '#7C3AED', 'bold': true }
          break
        case 'icon-title':
          format = { 'header': 2, 'color': '#D97706', 'bold': true }
          break
        case 'underline-title':
          format = { 'header': 2, 'color': '#3730A3', 'bold': true, 'underline': true }
          break
        case 'frame-title':
          format = { 'header': 2, 'color': '#059669', 'bold': true }
          break
        case 'highlight-title':
          format = { 'header': 2, 'color': '#1F2937', 'bold': true, 'background': '#FEF3C7' }
          break
        case 'arrow-title':
          format = { 'header': 2, 'color': '#DC2626', 'bold': true }
          break
        default:
          format = { 'header': 2, 'bold': true }
      }

      quill.formatText(range.index, range.length, format)
    }
  }, [])

  // 监听样式变化
  useEffect(() => {
    if (selectedStyle && selectedStyle !== 'default') {
      applyTitleStyle(selectedStyle)
    }
  }, [selectedStyle, applyTitleStyle])

  // 设置拖拽事件监听
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 添加拖拽事件监听
    container.addEventListener('drop', handleDrop)
    container.addEventListener('dragover', handleDragOver)
    container.addEventListener('dragenter', handleDragEnter)

    return () => {
      container.removeEventListener('drop', handleDrop)
      container.removeEventListener('dragover', handleDragOver)
      container.removeEventListener('dragenter', handleDragEnter)
    }
  }, [handleDrop, handleDragOver, handleDragEnter])

  // 添加工具提示
  useEffect(() => {
    const addTooltips = () => {
      const toolbarButtons = document.querySelectorAll('.ql-toolbar button, .ql-toolbar .ql-picker')

      const tooltips: { [key: string]: string } = {
        'ql-header': '标题级别',
        'ql-bold': '粗体 (Ctrl+B)',
        'ql-italic': '斜体 (Ctrl+I)',
        'ql-underline': '下划线 (Ctrl+U)',
        'ql-strike': '删除线',
        'ql-list': '列表',
        'ql-blockquote': '引用',
        'ql-code-block': '代码块',
        'ql-color': '文字颜色',
        'ql-background': '背景颜色',
        'ql-align': '对齐方式',
        'ql-link': '插入链接',
        'ql-image': '插入图片',
        'ql-clean': '清除格式',
        'ql-undo': '撤回 (Ctrl+Z)',
        'ql-redo': '重做 (Ctrl+Y)'
      }

      toolbarButtons.forEach(button => {
        const className = button.className || ''
        let tooltip = ''

        // 检查特殊的列表按钮
        if (button.tagName === 'BUTTON') {
          const buttonElement = button as HTMLButtonElement
          if (buttonElement.value === 'ordered') {
            tooltip = '有序列表'
          } else if (buttonElement.value === 'bullet') {
            tooltip = '无序列表'
          }
        }

        // 检查其他按钮
        if (!tooltip) {
          for (const [key, value] of Object.entries(tooltips)) {
            if (className.includes(key)) {
              tooltip = value
              break
            }
          }
        }

        if (tooltip) {
          button.setAttribute('title', tooltip)
        }
      })
    }

    // 延迟添加工具提示，确保DOM已渲染
    const timer = setTimeout(addTooltips, 300)
    return () => clearTimeout(timer)
  }, [content]) // 依赖content确保每次重新渲染都添加tooltip

  // 编辑器配置
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean'],
        ['undo', 'redo']  // 撤回和重做按钮移到末尾
      ],
      handlers: {
        'image': handleImageUpload,
        'undo': handleUndo,
        'redo': handleRedo
      }
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    }
  }

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image', 'color', 'background', 'align'
  ]

  const handleChange = (value: string) => {
    setContent(value)
  }

  // 处理编辑器选择变化，检测是否选中图片
  const handleSelectionChange = useCallback((range: any, oldRange: any, source: string) => {
    if (!range) {
      setSelectedImageId(null)
      return
    }

    const quill = quillRef.current?.getEditor()
    if (!quill) return

    try {
      // 获取选中位置的内容
      const [leaf] = quill.getLeaf(range.index)

      // 检查是否是图片
      if (leaf && leaf.domNode && leaf.domNode.tagName === 'IMG') {
        const imageId = leaf.domNode.getAttribute('data-image-id')
        if (imageId) {
          setSelectedImageId(imageId)
          console.log('选中图片:', imageId)
        } else {
          setSelectedImageId(null)
        }
      } else {
        // 检查选中范围内是否包含图片
        const contents = quill.getContents(range.index, range.length)
        let hasImage = false
        let imageId = null

        contents.ops?.forEach((op: any) => {
          if (op.insert && typeof op.insert === 'object' && op.insert.image) {
            hasImage = true
            // 尝试从DOM中找到对应的图片元素
            const images = quill.root.querySelectorAll('img')
            images.forEach((img: HTMLImageElement) => {
              if (img.src === op.insert.image) {
                imageId = img.getAttribute('data-image-id')
              }
            })
          }
        })

        if (hasImage && imageId) {
          setSelectedImageId(imageId)
          console.log('选中范围包含图片:', imageId)
        } else {
          setSelectedImageId(null)
        }
      }
    } catch (error) {
      console.error('检测图片选中状态失败:', error)
      setSelectedImageId(null)
    }
  }, [setSelectedImageId])

  // 添加点击事件监听器来检测图片选中
  useEffect(() => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return

    // 监听选择变化
    quill.on('selection-change', handleSelectionChange)

    // 添加图片点击事件监听
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG') {
        const imageId = target.getAttribute('data-image-id')
        if (imageId) {
          setSelectedImageId(imageId)
          console.log('点击选中图片:', imageId)

          // 高亮显示选中的图片
          const allImages = quill.root.querySelectorAll('img')
          allImages.forEach((img: HTMLImageElement) => {
            img.style.outline = ''
          })
          target.style.outline = '2px solid #07C160'
        }
      } else {
        // 点击其他地方时取消图片选中
        setSelectedImageId(null)
        const allImages = quill.root.querySelectorAll('img')
        allImages.forEach((img: HTMLImageElement) => {
          img.style.outline = ''
        })
      }
    }

    const editorElement = quill.root
    editorElement.addEventListener('click', handleImageClick)

    return () => {
      quill.off('selection-change', handleSelectionChange)
      editorElement.removeEventListener('click', handleImageClick)
    }
  }, [handleSelectionChange, setSelectedImageId])

  // 注册编辑器实例到全局管理器
  useEffect(() => {
    const quill = quillRef.current?.getEditor()
    if (quill) {
      editorManager.registerQuill(quill)

      // 同时注册到window对象供其他组件使用
      ;(window as any).quillInstance = quill

      console.log('Quill编辑器已初始化并注册')
    }
  }, [])

  // 清理编辑器实例
  useEffect(() => {
    return () => {
      editorManager.cleanup()
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* 头部标题区域 */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4">
        <h2 className="font-semibold text-lg text-gray-800 mb-2">文章编辑器</h2>
        <p className="text-sm text-gray-600">
          支持富文本编辑、图片拖拽上传、样式模板等功能
        </p>
      </div>

      {/* 编辑器容器 - 使用flex-1使其占据剩余空间 */}
      <div
        ref={containerRef}
        className="flex-1 relative min-h-0"
      >
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          className="h-full quill-editor-fixed"
          placeholder="在这里开始编写你的微信文章..."
          theme="snow"
        />
      </div>

      {/* 底部状态栏 */}
      <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>💡 提示：可以拖拽图片到编辑器中直接上传</span>
            <span>📝 快捷键：Ctrl+Z撤回，Ctrl+Y重做</span>
          </div>
          <div className="flex items-center gap-2">
            <span>字数统计:</span>
            <span className="font-medium text-gray-800">
              {content.replace(/<[^>]*>/g, '').length} 字
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuillEditor