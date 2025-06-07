import React, { useState } from 'react'
import { Clock, Eye, RotateCcw, Trash2, Save, GitCompare, Archive, Download, BarChart3 } from 'lucide-react'
import useEditorStore from '../../stores/editorStore'

const HistoryVersionPage: React.FC = () => {
  const {
    historyVersions,
    saveCurrentVersion,
    restoreVersion,
    deleteVersion,
    clearOldVersions,
    title,
    content,
    author
  } = useEditorStore()

  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [previewVersion, setPreviewVersion] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [showStats, setShowStats] = useState(false)

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

  // 保存当前版本
  const handleSaveCurrentVersion = () => {
    const description = prompt('请输入版本描述（可选）:')
    if (description !== null) { // 用户没有取消
      saveCurrentVersion(description || undefined)
      showNotification('💾', '当前版本已保存', '#07C160')
    }
  }

  // 恢复版本
  const handleRestoreVersion = (versionId: string) => {
    const version = historyVersions.find(v => v.id === versionId)
    if (!version) return

    if (confirm(`确定要恢复到版本"${version.title}"吗？当前未保存的更改将丢失。`)) {
      restoreVersion(versionId)
      showNotification('✅', '版本已恢复', '#07C160')
    }
  }

  // 删除版本
  const handleDeleteVersion = (versionId: string) => {
    const version = historyVersions.find(v => v.id === versionId)
    if (!version) return

    if (confirm(`确定要删除版本"${version.title}"吗？此操作不可恢复。`)) {
      deleteVersion(versionId)
      showNotification('🗑️', '版本已删除', '#DC2626')
    }
  }

  // 清理旧版本
  const handleClearOldVersions = () => {
    if (confirm('确定要清理一周前的旧版本吗？此操作不可恢复。')) {
      clearOldVersions()
      showNotification('🧹', '旧版本已清理', '#07C160')
    }
  }

  // 预览版本
  const handlePreviewVersion = (versionId: string) => {
    setPreviewVersion(versionId)
  }

  // 版本比较功能
  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      showNotification('⚠️', '请选择两个版本进行比较', '#F59E0B')
      return
    }
    setCompareMode(true)
  }

  // 选择版本进行比较
  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId)
      } else if (prev.length < 2) {
        return [...prev, versionId]
      } else {
        showNotification('⚠️', '最多只能选择两个版本进行比较', '#F59E0B')
        return prev
      }
    })
  }

  // 导出版本
  const handleExportVersion = (versionId: string) => {
    const version = versionId === 'current'
      ? currentVersion
      : historyVersions.find(v => v.id === versionId)

    if (!version) return

    const exportData = {
      title: version.title,
      author: version.author || author,
      content: version.content,
      createDate: version.createDate || new Date(),
      wordCount: version.wordCount,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${version.title || '未命名文章'}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showNotification('📥', '版本已导出', '#07C160')
  }

  // 计算版本统计信息
  const getVersionStats = () => {
    if (historyVersions.length === 0) return null

    const totalVersions = historyVersions.length
    const totalWords = historyVersions.reduce((sum, v) => sum + v.wordCount, 0)
    const avgWords = Math.round(totalWords / totalVersions)
    const latestVersion = historyVersions[0]
    const oldestVersion = historyVersions[historyVersions.length - 1]
    const timeSpan = latestVersion && oldestVersion
      ? Math.ceil((latestVersion.createDate.getTime() - oldestVersion.createDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return {
      totalVersions,
      totalWords,
      avgWords,
      timeSpan
    }
  }

  // 文本差异比较（简单实现）
  const compareTexts = (text1: string, text2: string) => {
    const words1 = text1.replace(/<[^>]*>/g, '').split(/\s+/)
    const words2 = text2.replace(/<[^>]*>/g, '').split(/\s+/)

    const added = words2.filter(word => !words1.includes(word)).length
    const removed = words1.filter(word => !words2.includes(word)).length
    const unchanged = Math.min(words1.length, words2.length) - Math.max(added, removed)

    return { added, removed, unchanged }
  }

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // 获取当前版本信息
  const currentVersion = {
    title: title || '未命名文章',
    content,
    author: author || '未知作者',
    wordCount: content.replace(/<[^>]*>/g, '').length,
    createDate: new Date()
  }

  return (
    <div className="flex-1">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">历史版本</h2>
            <p className="text-sm text-gray-600 mt-1">
              管理文章的历史版本，支持版本恢复和比较
            </p>
          </div>
          <button
            onClick={handleSaveCurrentVersion}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存当前版本
          </button>
        </div>

        {/* 当前版本 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">当前版本</h3>
          <div className="border border-primary bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">{currentVersion.title}</h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(currentVersion.createDate)} · {currentVersion.wordCount} 字
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-primary text-white px-2 py-1 rounded text-xs">当前</span>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handlePreviewVersion('current')}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-700">
              <p>正在编辑中的版本</p>
            </div>
          </div>
        </div>

        {/* 历史版本列表 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">历史版本 ({historyVersions.length})</h3>
            <div className="flex items-center gap-2">
              {selectedVersions.length > 0 && (
                <span className="text-sm text-gray-600">
                  已选择 {selectedVersions.length} 个版本
                </span>
              )}
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-gray-500 hover:text-gray-700 p-1"
                title="版本统计"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 版本统计信息 */}
          {showStats && historyVersions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-2">版本统计</h4>
              {(() => {
                const stats = getVersionStats()
                return stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">总版本数</span>
                      <p className="font-semibold text-lg">{stats.totalVersions}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">总字数</span>
                      <p className="font-semibold text-lg">{stats.totalWords}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">平均字数</span>
                      <p className="font-semibold text-lg">{stats.avgWords}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">时间跨度</span>
                      <p className="font-semibold text-lg">{stats.timeSpan} 天</p>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          )}

          {historyVersions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">还没有保存任何历史版本</p>
              <p className="text-sm text-gray-400">点击"保存当前版本"来创建第一个版本</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyVersions.map((version, index) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedVersions.includes(version.id)
                      ? 'border-primary bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedVersions.includes(version.id)}
                        onChange={() => toggleVersionSelection(version.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{version.title}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(version.createDate)} · {version.wordCount} 字
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-secondary hover:text-blue-700 text-sm flex items-center gap-1"
                        onClick={() => handlePreviewVersion(version.id)}
                        title="预览版本"
                      >
                        <Eye className="w-3 h-3" />
                        预览
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                        onClick={() => handleExportVersion(version.id)}
                        title="导出版本"
                      >
                        <Download className="w-3 h-3" />
                        导出
                      </button>
                      <button
                        className="text-primary hover:text-green-700 text-sm flex items-center gap-1"
                        onClick={() => handleRestoreVersion(version.id)}
                        title="恢复版本"
                      >
                        <RotateCcw className="w-3 h-3" />
                        恢复
                      </button>
                      <button
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        onClick={() => handleDeleteVersion(version.id)}
                        title="删除版本"
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <p>{version.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 版本管理工具 */}
        {historyVersions.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3">版本管理工具</h3>
            <div className="flex flex-wrap gap-3">
              <button
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  selectedVersions.length === 2
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleCompareVersions}
                disabled={selectedVersions.length !== 2}
                title={selectedVersions.length !== 2 ? '请选择两个版本进行比较' : '比较选中的版本'}
              >
                <GitCompare className="w-4 h-4" />
                比较版本 {selectedVersions.length > 0 && `(${selectedVersions.length}/2)`}
              </button>
              <button
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors flex items-center gap-2"
                onClick={() => handleExportVersion('current')}
                title="导出当前版本"
              >
                <Download className="w-4 h-4" />
                导出当前版本
              </button>
              <button
                className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors flex items-center gap-2"
                onClick={handleClearOldVersions}
                title="清理一周前的旧版本"
              >
                <Archive className="w-4 h-4" />
                清理旧版本
              </button>
              {selectedVersions.length > 0 && (
                <button
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  onClick={() => setSelectedVersions([])}
                  title="取消选择"
                >
                  取消选择
                </button>
              )}
            </div>
          </div>
        )}

        {/* 版本预览模态框 */}
        {previewVersion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {previewVersion === 'current' ? '当前版本预览' : '历史版本预览'}
                </h3>
                <button
                  onClick={() => setPreviewVersion(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="prose max-w-none">
                  {previewVersion === 'current' ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <div dangerouslySetInnerHTML={{
                      __html: historyVersions.find(v => v.id === previewVersion)?.content || ''
                    }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 版本比较模态框 */}
        {compareMode && selectedVersions.length === 2 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] mx-4 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">版本比较</h3>
                <button
                  onClick={() => {
                    setCompareMode(false)
                    setSelectedVersions([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                {(() => {
                  const version1 = selectedVersions[0] === 'current'
                    ? currentVersion
                    : historyVersions.find(v => v.id === selectedVersions[0])
                  const version2 = selectedVersions[1] === 'current'
                    ? currentVersion
                    : historyVersions.find(v => v.id === selectedVersions[1])

                  if (!version1 || !version2) return null

                  const diff = compareTexts(version1.content, version2.content)

                  return (
                    <div className="p-4">
                      {/* 比较统计 */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">比较统计</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <span className="text-green-600 font-semibold text-lg">{diff.added}</span>
                            <p className="text-gray-600">新增词汇</p>
                          </div>
                          <div className="text-center">
                            <span className="text-red-600 font-semibold text-lg">{diff.removed}</span>
                            <p className="text-gray-600">删除词汇</p>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-600 font-semibold text-lg">{diff.unchanged}</span>
                            <p className="text-gray-600">保持不变</p>
                          </div>
                        </div>
                      </div>

                      {/* 并排比较 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2 pb-2 border-b">
                            版本1: {version1.title}
                          </h4>
                          <div className="text-sm text-gray-600 mb-2">
                            {formatDate(version1.createDate)} · {version1.wordCount} 字
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: version1.content }} />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2 pb-2 border-b">
                            版本2: {version2.title}
                          </h4>
                          <div className="text-sm text-gray-600 mb-2">
                            {formatDate(version2.createDate)} · {version2.wordCount} 字
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: version2.content }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryVersionPage
