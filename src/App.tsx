import React from 'react'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import Editor from './components/Editor/QuillEditor'
import Preview from './components/Layout/Preview'
import StyleTemplates from './components/StyleManager/StyleTemplates'
import TopicManager from './components/TopicManager/TopicManager'
import ImageManager from './components/ImageProcessor/ImageManager'
import HistoryVersionPage from './components/HistoryVersion/HistoryVersionPage'
import FeatureCards from './components/Layout/FeatureCards'
import Footer from './components/Layout/Footer'
import useEditorStore from './stores/editorStore'
import useSettingsStore from './stores/settingsStore'
import './index.css'
import './styles/themes.css'

function App() {
  const { activeTab, setActiveTab, getAutoSaveStatus, lastSaved } = useEditorStore()
  const {
    exportFormat,
    includeStyles,
    autoSave,
    autoSaveInterval,
    realTimePreview,
    theme,
    setExportFormat,
    setIncludeStyles,
    setAutoSave,
    setAutoSaveInterval,
    setRealTimePreview,
    setTheme,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    loadSettings
  } = useSettingsStore()

  // 初始化设置
  React.useEffect(() => {
    loadSettings()

    // 将settingsStore暴露给editorStore使用
    ;(window as any).settingsStore = useSettingsStore
  }, [])

  // 自动保存状态更新
  React.useEffect(() => {
    const interval = setInterval(() => {
      const statusElement = document.querySelector('.auto-save-status')
      if (statusElement && autoSave) {
        statusElement.textContent = getAutoSaveStatus()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [autoSave, lastSaved, getAutoSaveStatus])

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
    }, 2000)
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <Editor />
            </div>
            <StyleTemplates />
          </div>
        )
      case 'images':
        return (
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">图片管理</h2>
              <ImageManager />
            </div>
          </div>
        )
      case 'styles':
        return (
          <div className="flex-1">
            <StyleTemplates />
          </div>
        )
      case 'topics':
        return (
          <div className="flex-1">
            <TopicManager />
          </div>
        )
      case 'history':
        return <HistoryVersionPage />
      case 'settings':
        return (
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">系统设置</h2>

              <div className="space-y-8">
                {/* 编辑器设置 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">编辑器设置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">自动保存</label>
                        <p className="text-sm text-gray-600">编辑时自动保存内容</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSave}
                          onChange={(e) => setAutoSave(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {autoSave && (
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">自动保存间隔</label>
                        <select
                          value={autoSaveInterval}
                          onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value={1}>1分钟</option>
                          <option value={3}>3分钟</option>
                          <option value={5}>5分钟</option>
                          <option value={10}>10分钟</option>
                        </select>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">实时预览</label>
                        <p className="text-sm text-gray-600">编辑时实时更新预览</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={realTimePreview}
                          onChange={(e) => setRealTimePreview(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 导出设置 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">导出设置</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">默认导出格式</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="export-format"
                            value="html"
                            checked={exportFormat === 'html'}
                            onChange={(e) => setExportFormat(e.target.value as any)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="ml-2">HTML格式 - 适合微信公众号</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="export-format"
                            value="markdown"
                            checked={exportFormat === 'markdown'}
                            onChange={(e) => setExportFormat(e.target.value as any)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="ml-2">Markdown格式 - 适合技术文档</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="export-format"
                            value="json"
                            checked={exportFormat === 'json'}
                            onChange={(e) => setExportFormat(e.target.value as any)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="ml-2">JSON格式 - 包含完整数据</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">包含样式信息</label>
                        <p className="text-sm text-gray-600">导出时包含完整的样式定义</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeStyles}
                          onChange={(e) => setIncludeStyles(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 主题设置 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">主题设置</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">界面主题</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                            theme === 'wechat-green' ? 'border-primary bg-green-50' : 'border-gray-300 hover:border-primary'
                          }`}
                          onClick={() => setTheme('wechat-green')}
                        >
                          <div className="w-full h-8 bg-primary rounded mb-2"></div>
                          <p className="text-sm text-center">微信绿</p>
                        </div>
                        <div
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                            theme === 'classic-blue' ? 'border-secondary bg-blue-50' : 'border-gray-300 hover:border-secondary'
                          }`}
                          onClick={() => setTheme('classic-blue')}
                        >
                          <div className="w-full h-8 bg-secondary rounded mb-2"></div>
                          <p className="text-sm text-center">科技蓝</p>
                        </div>
                        <div
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                            theme === 'elegant-purple' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500'
                          }`}
                          onClick={() => setTheme('elegant-purple')}
                        >
                          <div className="w-full h-8 bg-purple-500 rounded mb-2"></div>
                          <p className="text-sm text-center">优雅紫</p>
                        </div>
                        <div
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                            theme === 'warm-orange' ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-500'
                          }`}
                          onClick={() => setTheme('warm-orange')}
                        >
                          <div className="w-full h-8 bg-orange-500 rounded mb-2"></div>
                          <p className="text-sm text-center">温暖橙</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 数据管理 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">数据管理</h3>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        onClick={() => {
                          try {
                            exportSettings()
                            showNotification('📤', '设置导出成功', '#0085FF')
                          } catch (error) {
                            showNotification('❌', '导出失败，请重试', '#DC2626')
                          }
                        }}
                      >
                        导出设置
                      </button>
                      <button
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = '.json'
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (e) => {
                                try {
                                  const data = JSON.parse(e.target?.result as string)
                                  importSettings(data)
                                  showNotification('📥', '设置导入成功', '#07C160')
                                } catch (error) {
                                  showNotification('❌', '文件格式错误，请选择有效的JSON文件', '#DC2626')
                                }
                              }
                              reader.readAsText(file)
                            }
                          }
                          input.click()
                        }}
                      >
                        导入设置
                      </button>
                      <button
                        className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = '.html,.md,.txt'
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (e) => {
                                try {
                                  const content = e.target?.result as string
                                  const fileExtension = file.name.split('.').pop()?.toLowerCase()

                                  // 根据文件类型处理内容
                                  let processedContent = content
                                  if (fileExtension === 'md') {
                                    // 简单的Markdown转HTML
                                    processedContent = content
                                      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                                      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                                      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                      .replace(/\n/g, '<br>')
                                  } else if (fileExtension === 'txt') {
                                    // 纯文本转HTML
                                    processedContent = content.replace(/\n/g, '<br>')
                                  }

                                  // 导入到编辑器
                                  const { setContent, setTitle } = useEditorStore.getState()
                                  setContent(processedContent)
                                  setTitle(file.name.replace(/\.[^/.]+$/, ''))

                                  showNotification('📄', '文件导入成功', '#07C160')
                                } catch (error) {
                                  showNotification('❌', '文件读取失败，请重试', '#DC2626')
                                }
                              }
                              reader.readAsText(file)
                            }
                          }
                          input.click()
                        }}
                      >
                        导入文件
                      </button>
                      <button
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                        onClick={() => {
                          if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
                            localStorage.clear()
                            showNotification('🗑️', '所有数据已清空', '#DC2626')
                            // 刷新页面以重新加载默认设置
                            setTimeout(() => window.location.reload(), 1000)
                          }
                        }}
                      >
                        清空所有数据
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      注意：清空数据操作不可恢复，请谨慎操作
                    </p>
                  </div>
                </div>

                {/* 保存按钮 */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        if (confirm('确定要重置所有设置到默认值吗？')) {
                          resetSettings()
                          showNotification('🔄', '设置已重置为默认值', '#6B7280')
                        }
                      }}
                    >
                      重置设置
                    </button>
                    <button
                      className="bg-primary text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
                      onClick={() => {
                        saveSettings()
                        showNotification('✅', '设置保存成功', '#07C160')
                      }}
                    >
                      保存设置
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <Editor />
            </div>
            <StyleTemplates />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* 主界面三栏布局 */}
      <div className="flex-1 min-h-0">
        <div className="container mx-auto px-4 py-8 h-full">
          <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* 左侧边栏 */}
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            {/* 中间内容区域 */}
            <div className="flex-1 min-h-0 flex flex-col">
              {renderMainContent()}
            </div>

            {/* 右侧预览区域 */}
            <div className="w-full lg:w-preview flex-shrink-0">
              <Preview />
            </div>
          </div>
        </div>
      </div>

      {/* 底部功能展示区域 */}
      <div className="bg-white py-16 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              微信公众号排版工具
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              专业的微信公众号文章排版工具，提供富文本编辑、智能图片处理、样式管理和专题组织等全方位功能
            </p>
          </div>
          <FeatureCards />
        </div>
      </div>

      {/* 页脚 */}
      <Footer />
    </div>
  )
}

export default App
