import { create } from 'zustand'

interface ImageSettings {
  size: 'original' | 'large' | 'medium' | 'small'
  align: 'left' | 'center' | 'right'
  caption: string
  borderRadius: number
  shadow: boolean
  border: boolean
}

interface ImageItem {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadDate: Date
}

interface HistoryVersion {
  id: string
  title: string
  content: string
  author: string
  createDate: Date
  description: string
  wordCount: number
}

interface EditorState {
  // 文章基本信息
  title: string
  author: string
  content: string
  coverImage: string

  // 编辑器设置
  activeTab: string
  isPreviewMode: boolean

  // 样式设置
  selectedStyle: string
  customColors: {
    primary: string
    secondary: string
    accent: string
  }

  // 图片处理设置
  imageSettings: ImageSettings
  selectedImageId: string | null
  uploadedImages: ImageItem[]

  // 历史版本
  historyVersions: HistoryVersion[]

  // 自动保存相关
  lastSaved: Date | null
  autoSaveTimer: NodeJS.Timeout | null
  isSaving: boolean

  // 操作方法
  setTitle: (title: string) => void
  setAuthor: (author: string) => void
  setContent: (content: string) => void
  setCoverImage: (image: string) => void
  setActiveTab: (tab: string) => void
  setPreviewMode: (mode: boolean) => void
  setSelectedStyle: (style: string) => void
  setCustomColors: (colors: Partial<EditorState['customColors']>) => void
  setImageSettings: (settings: Partial<ImageSettings>) => void
  setSelectedImageId: (id: string | null) => void
  addUploadedImage: (image: ImageItem) => void
  removeUploadedImage: (id: string) => void

  // 历史版本方法
  saveCurrentVersion: (description?: string) => void
  restoreVersion: (versionId: string) => void
  deleteVersion: (versionId: string) => void
  clearOldVersions: () => void

  // 实用方法
  getPreviewContent: () => string
  exportContent: () => string
  resetEditor: () => void
  applyImageSettings: () => void

  // 自动保存方法
  triggerAutoSave: () => void
  performAutoSave: () => void
  getAutoSaveStatus: () => string
}

const useEditorStore = create<EditorState>((set, get) => ({
  // 初始状态
  title: 'React开发最佳实践指南',
  author: '前端技术团队',
  content: `
    <h1>React开发最佳实践指南</h1>
    <p>在当今的前端开发领域，React已经成为最受欢迎的JavaScript库之一。本文将介绍React开发中的最佳实践，帮助您构建更高效、更可维护的应用程序。</p>

    <h2>1. 组件设计原则</h2>
    <p>良好的组件设计是React应用成功的关键：</p>
    <ul>
      <li><strong>单一职责原则</strong>：每个组件应该只负责一个功能</li>
      <li><strong>可组合性</strong>：设计可重用的组件</li>
      <li><strong>状态管理</strong>：合理使用状态提升和Context API</li>
    </ul>

    <h2>2. 性能优化技巧</h2>
    <blockquote>
      "性能优化应该基于实际测量，而不是猜测。使用React DevTools进行分析是第一步。"
    </blockquote>
    <p>关键优化策略包括：</p>
    <ol>
      <li>使用React.memo进行组件记忆</li>
      <li>合理使用useCallback和useMemo</li>
      <li>代码分割和懒加载</li>
    </ol>
  `,
  coverImage: '',
  activeTab: 'editor',
  isPreviewMode: false,
  selectedStyle: 'default',
  customColors: {
    primary: '#07C160',
    secondary: '#0085FF',
    accent: '#9333EA'
  },
  imageSettings: {
    size: 'medium',
    align: 'center',
    caption: '',
    borderRadius: 4,
    shadow: true,
    border: false
  },
  selectedImageId: null,
  uploadedImages: [],
  lastSaved: null,
  autoSaveTimer: null,
  isSaving: false,
  historyVersions: (() => {
    try {
      const saved = localStorage.getItem('wechat-tool-history')
      if (saved) {
        return JSON.parse(saved).map((v: any) => ({
          ...v,
          createDate: new Date(v.createDate)
        }))
      }
    } catch (error) {
      console.error('加载历史版本失败:', error)
    }
    return []
  })(),

  // 设置方法
  setTitle: (title) => {
    set({ title })
    // 触发自动保存
    get().triggerAutoSave()
  },
  setAuthor: (author) => {
    set({ author })
    // 触发自动保存
    get().triggerAutoSave()
  },
  setContent: (content) => {
    set({ content })
    // 触发自动保存
    get().triggerAutoSave()
  },
  setCoverImage: (coverImage) => {
    set({ coverImage })
    // 触发自动保存
    get().triggerAutoSave()
  },
  setActiveTab: (activeTab) => set({ activeTab }),
  setPreviewMode: (isPreviewMode) => set({ isPreviewMode }),
  setSelectedStyle: (selectedStyle) => set({ selectedStyle }),
  setCustomColors: (colors) => set((state) => ({
    customColors: { ...state.customColors, ...colors }
  })),
  setImageSettings: (settings) => set((state) => ({
    imageSettings: { ...state.imageSettings, ...settings }
  })),
  setSelectedImageId: (selectedImageId) => set({ selectedImageId }),
  addUploadedImage: (image) => set((state) => ({
    uploadedImages: [...state.uploadedImages, image]
  })),
  removeUploadedImage: (id) => set((state) => ({
    uploadedImages: state.uploadedImages.filter(img => img.id !== id)
  })),

  // 历史版本方法
  saveCurrentVersion: (description) => set((state) => {
    const { title, content, author } = state

    if (!content.trim()) {
      console.warn('内容为空，无法保存版本')
      return state
    }

    const version: HistoryVersion = {
      id: Date.now().toString(),
      title: title || '未命名文章',
      content,
      author: author || '未知作者',
      createDate: new Date(),
      description: description || '手动保存版本',
      wordCount: content.replace(/<[^>]*>/g, '').length
    }

    const updatedVersions = [version, ...state.historyVersions].slice(0, 50) // 最多保存50个版本

    // 保存到localStorage
    try {
      localStorage.setItem('wechat-tool-history', JSON.stringify(updatedVersions))
    } catch (error) {
      console.error('保存历史版本失败:', error)
    }

    return {
      ...state,
      historyVersions: updatedVersions
    }
  }),

  restoreVersion: (versionId) => set((state) => {
    const version = state.historyVersions.find(v => v.id === versionId)
    if (!version) {
      console.error('版本不存在:', versionId)
      return state
    }

    return {
      ...state,
      title: version.title,
      content: version.content,
      author: version.author
    }
  }),

  deleteVersion: (versionId) => set((state) => {
    const updatedVersions = state.historyVersions.filter(v => v.id !== versionId)

    // 更新localStorage
    try {
      localStorage.setItem('wechat-tool-history', JSON.stringify(updatedVersions))
    } catch (error) {
      console.error('删除历史版本失败:', error)
    }

    return {
      ...state,
      historyVersions: updatedVersions
    }
  }),

  clearOldVersions: () => set((state) => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const recentVersions = state.historyVersions.filter(v =>
      new Date(v.createDate) > oneWeekAgo
    )

    // 更新localStorage
    try {
      localStorage.setItem('wechat-tool-history', JSON.stringify(recentVersions))
    } catch (error) {
      console.error('清理历史版本失败:', error)
    }

    return {
      ...state,
      historyVersions: recentVersions
    }
  }),

  // 实用方法
  getPreviewContent: () => {
    const state = get()
    return `
      <div class="wechat-article">
        <h1 class="article-title">${state.title}</h1>
        <div class="article-meta">
          <span class="author">作者：${state.author}</span>
        </div>
        ${state.coverImage ? `<img src="${state.coverImage}" alt="封面图片" class="cover-image" />` : ''}
        <div class="article-content">
          ${state.content}
        </div>
      </div>
    `
  },

  exportContent: () => {
    const state = get()
    return JSON.stringify({
      title: state.title,
      author: state.author,
      content: state.content,
      coverImage: state.coverImage,
      customColors: state.customColors,
      selectedStyle: state.selectedStyle,
      exportDate: new Date().toISOString()
    }, null, 2)
  },

  resetEditor: () => set({
    title: '',
    author: '',
    content: '',
    coverImage: '',
    selectedStyle: 'default',
    customColors: {
      primary: '#07C160',
      secondary: '#0085FF',
      accent: '#9333EA'
    },
    imageSettings: {
      size: 'medium',
      align: 'center',
      caption: '',
      borderRadius: 4,
      shadow: true,
      border: false
    },
    selectedImageId: null
  }),

  applyImageSettings: () => {
    const state = get()
    const { imageSettings, selectedImageId } = state

    // 如果没有选中的图片，应用到所有图片
    const selector = selectedImageId
      ? `img[data-image-id="${selectedImageId}"]`
      : '.ql-editor img'

    const images = document.querySelectorAll(selector)

    images.forEach((img: Element) => {
      const imgElement = img as HTMLImageElement

      // 获取图片的原始尺寸
      const originalWidth = imgElement.naturalWidth
      const originalHeight = imgElement.naturalHeight

      // 计算合适的显示尺寸
      let targetWidth: string
      let targetHeight: string = 'auto'

      switch (imageSettings.size) {
        case 'original':
          // 保持原始尺寸，但不超过容器宽度
          if (originalWidth > 600) {
            targetWidth = '600px'
          } else {
            targetWidth = `${originalWidth}px`
          }
          break
        case 'large':
          targetWidth = '100%'
          break
        case 'medium':
          targetWidth = '80%'
          break
        case 'small':
          targetWidth = '60%'
          break
        default:
          targetWidth = '80%'
      }

      // 应用尺寸设置
      imgElement.style.width = targetWidth
      imgElement.style.height = targetHeight
      imgElement.style.maxWidth = '100%'

      // 应用对齐设置
      const parentElement = imgElement.parentElement
      if (parentElement) {
        switch (imageSettings.align) {
          case 'left':
            parentElement.style.textAlign = 'left'
            imgElement.style.display = 'block'
            imgElement.style.marginLeft = '0'
            imgElement.style.marginRight = 'auto'
            break
          case 'center':
            parentElement.style.textAlign = 'center'
            imgElement.style.display = 'block'
            imgElement.style.marginLeft = 'auto'
            imgElement.style.marginRight = 'auto'
            break
          case 'right':
            parentElement.style.textAlign = 'right'
            imgElement.style.display = 'block'
            imgElement.style.marginLeft = 'auto'
            imgElement.style.marginRight = '0'
            break
        }
      }

      // 应用圆角设置
      imgElement.style.borderRadius = `${imageSettings.borderRadius}px`

      // 应用阴影设置
      if (imageSettings.shadow) {
        imgElement.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      } else {
        imgElement.style.boxShadow = 'none'
      }

      // 应用边框设置
      if (imageSettings.border) {
        imgElement.style.border = '2px solid #e5e7eb'
        imgElement.style.padding = '4px'
      } else {
        imgElement.style.border = 'none'
        imgElement.style.padding = '0'
      }

      // 添加图片说明
      if (imageSettings.caption && imageSettings.caption.trim()) {
        // 移除已存在的说明
        const existingCaption = imgElement.parentElement?.querySelector('.image-caption')
        if (existingCaption) {
          existingCaption.remove()
        }

        // 添加新的说明
        const caption = document.createElement('div')
        caption.className = 'image-caption'
        caption.textContent = imageSettings.caption
        caption.style.cssText = `
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          margin-top: 8px;
          margin-bottom: 16px;
          font-style: italic;
          line-height: 1.4;
        `

        // 插入说明到图片容器中
        if (imgElement.parentElement) {
          imgElement.parentElement.appendChild(caption)
        }
      } else {
        // 如果没有说明，移除已存在的说明
        const existingCaption = imgElement.parentElement?.querySelector('.image-caption')
        if (existingCaption) {
          existingCaption.remove()
        }
      }

      // 添加过渡动画
      imgElement.style.transition = 'all 0.3s ease'
    })
  },

  // 自动保存方法
  triggerAutoSave: () => {
    const state = get()

    // 清除之前的定时器
    if (state.autoSaveTimer) {
      clearTimeout(state.autoSaveTimer)
    }

    // 检查是否启用自动保存
    const settingsStore = (window as any).settingsStore
    if (!settingsStore?.getState?.()?.autoSave) {
      return
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      get().performAutoSave()
    }, (settingsStore?.getState?.()?.autoSaveInterval || 30) * 1000)

    set({ autoSaveTimer: timer })
  },

  performAutoSave: () => {
    const state = get()

    if (state.isSaving) {
      console.log('正在保存中，跳过此次自动保存')
      return
    }

    if (!state.content || state.content.trim() === '') {
      console.log('内容为空，跳过自动保存')
      return
    }

    set({ isSaving: true })

    try {
      // 保存到localStorage
      const autoSaveData = {
        title: state.title,
        author: state.author,
        content: state.content,
        coverImage: state.coverImage,
        customColors: state.customColors,
        selectedStyle: state.selectedStyle,
        lastSaved: new Date().toISOString()
      }

      localStorage.setItem('wechat-tool-autosave', JSON.stringify(autoSaveData))

      set({
        lastSaved: new Date(),
        isSaving: false
      })

      console.log('自动保存成功')

      // 显示保存状态
      const statusElement = document.querySelector('.auto-save-status')
      if (statusElement) {
        statusElement.textContent = '已自动保存'
        statusElement.className = 'auto-save-status text-green-600'
      }

    } catch (error) {
      console.error('自动保存失败:', error)
      set({ isSaving: false })

      // 显示错误状态
      const statusElement = document.querySelector('.auto-save-status')
      if (statusElement) {
        statusElement.textContent = '保存失败'
        statusElement.className = 'auto-save-status text-red-600'
      }
    }
  },

  getAutoSaveStatus: () => {
    const state = get()

    if (state.isSaving) {
      return '正在保存...'
    }

    if (state.lastSaved) {
      const now = new Date()
      const diff = Math.floor((now.getTime() - state.lastSaved.getTime()) / 1000)

      if (diff < 60) {
        return `${diff}秒前已保存`
      } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}分钟前已保存`
      } else {
        return `${Math.floor(diff / 3600)}小时前已保存`
      }
    }

    return '未保存'
  }
}))

export default useEditorStore