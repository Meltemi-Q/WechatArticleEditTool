import { create } from 'zustand'

interface SettingsState {
  // 导出设置
  exportFormat: 'html' | 'markdown' | 'json'
  includeStyles: boolean

  // 编辑器设置
  autoSave: boolean
  autoSaveInterval: number // 分钟
  realTimePreview: boolean

  // 界面设置
  theme: 'wechat-green' | 'classic-blue' | 'elegant-purple' | 'warm-orange'

  // 操作方法
  setExportFormat: (format: 'html' | 'markdown' | 'json') => void
  setIncludeStyles: (include: boolean) => void
  setAutoSave: (enabled: boolean) => void
  setAutoSaveInterval: (interval: number) => void
  setRealTimePreview: (enabled: boolean) => void
  setTheme: (theme: SettingsState['theme']) => void

  // 数据管理
  saveSettings: () => void
  loadSettings: () => void
  resetSettings: () => void
  exportSettings: () => void
  importSettings: (data: any) => void
}

// 默认设置
const defaultSettings = {
  exportFormat: 'html' as const,
  includeStyles: true,
  autoSave: true,
  autoSaveInterval: 5,
  realTimePreview: true,
  theme: 'wechat-green' as const
}

// 获取主题名称
const getThemeName = (theme: string) => {
  const themeNames = {
    'wechat-green': '微信绿',
    'classic-blue': '科技蓝',
    'elegant-purple': '优雅紫',
    'warm-orange': '温暖橙'
  }
  return themeNames[theme as keyof typeof themeNames] || '未知主题'
}

// 加载保存的设置
const loadSavedSettings = () => {
  try {
    const saved = localStorage.getItem('wechat-tool-settings')
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) }
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
  return defaultSettings
}

const useSettingsStore = create<SettingsState>((set, get) => ({
  // 初始状态
  ...loadSavedSettings(),

  // 设置方法
  setExportFormat: (format) => {
    set({ exportFormat: format })
    get().saveSettings()
  },

  setIncludeStyles: (include) => {
    set({ includeStyles: include })
    get().saveSettings()
  },

  setAutoSave: (enabled) => {
    set({ autoSave: enabled })
    get().saveSettings()
  },

  setAutoSaveInterval: (interval) => {
    set({ autoSaveInterval: interval })
    get().saveSettings()
  },

  setRealTimePreview: (enabled) => {
    set({ realTimePreview: enabled })
    get().saveSettings()
  },

  setTheme: (theme) => {
    console.log('切换主题到:', theme)
    set({ theme })
    get().saveSettings()

    // 实时应用主题
    document.documentElement.setAttribute('data-theme', theme)

    // 强制重新渲染以应用CSS变量
    document.body.style.setProperty('--theme-transition', 'all 0.3s ease')

    // 添加视觉反馈
    const notification = document.createElement('div')
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: var(--primary-color);">🎨</span>
        <span>主题已切换为：${getThemeName(theme)}</span>
      </div>
    `
    notification.className = 'fixed top-4 right-4 bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border z-50 notification'
    document.body.appendChild(notification)

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 2000)
  },

  // 保存设置
  saveSettings: () => {
    const state = get()
    const settings = {
      exportFormat: state.exportFormat,
      includeStyles: state.includeStyles,
      autoSave: state.autoSave,
      autoSaveInterval: state.autoSaveInterval,
      realTimePreview: state.realTimePreview,
      theme: state.theme
    }

    try {
      localStorage.setItem('wechat-tool-settings', JSON.stringify(settings))
      console.log('设置已保存')
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  },

  // 加载设置
  loadSettings: () => {
    const settings = loadSavedSettings()
    set(settings)

    // 应用设置到界面
    const { theme } = settings

    console.log('加载设置:', settings)

    // 应用主题
    document.documentElement.setAttribute('data-theme', theme)
    console.log('应用主题:', theme)

    // 确保主题CSS变量生效
    document.body.style.setProperty('--theme-loaded', 'true')
  },

  // 重置设置
  resetSettings: () => {
    set(defaultSettings)
    get().saveSettings()

    // 重新应用默认设置
    get().loadSettings()
  },

  // 导出设置
  exportSettings: () => {
    const state = get()
    const settings = {
      exportFormat: state.exportFormat,
      includeStyles: state.includeStyles,
      autoSave: state.autoSave,
      autoSaveInterval: state.autoSaveInterval,
      realTimePreview: state.realTimePreview,
      theme: state.theme,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wechat-tool-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  // 导入设置
  importSettings: (data) => {
    try {
      const importedSettings = {
        exportFormat: data.exportFormat ?? defaultSettings.exportFormat,
        includeStyles: data.includeStyles !== undefined ? data.includeStyles : defaultSettings.includeStyles,
        autoSave: data.autoSave !== undefined ? data.autoSave : defaultSettings.autoSave,
        autoSaveInterval: data.autoSaveInterval || defaultSettings.autoSaveInterval,
        realTimePreview: data.realTimePreview ?? defaultSettings.realTimePreview,
        theme: data.theme ?? defaultSettings.theme
      }

      set(importedSettings)
      get().saveSettings()
      get().loadSettings()

      console.log('设置导入成功')
    } catch (error) {
      console.error('导入设置失败:', error)
      throw error
    }
  }
}))

export default useSettingsStore
