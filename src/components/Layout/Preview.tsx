import React, { useMemo } from 'react'
import { Smartphone, Eye, Copy, Code, Save } from 'lucide-react'
import useEditorStore from '../../stores/editorStore'

const Preview: React.FC = () => {
  const {
    title,
    author,
    content,
    coverImage,
    exportContent,
    imageSettings,
    selectedImageId,
    setImageSettings,
    applyImageSettings
  } = useEditorStore()

  // 处理和清理HTML内容，确保正确渲染
  const processedContent = useMemo(() => {
    if (!content) return ''

    // 处理HTML内容，确保样式正确
    let processed = content
      // 确保段落样式
      .replace(/<p>/g, '<p style="margin: 15px 0; color: #333; font-size: 16px; line-height: 1.6;">')
      // 确保标题样式
      .replace(/<h1>/g, '<h1 style="font-size: 22px; font-weight: bold; margin: 20px 0 15px; color: #1A1A1A; line-height: 1.4;">')
      .replace(/<h2>/g, '<h2 style="font-size: 18px; font-weight: bold; margin: 25px 0 15px; color: #1A1A1A; line-height: 1.4;">')
      .replace(/<h3>/g, '<h3 style="font-size: 16px; font-weight: bold; margin: 20px 0 10px; color: #1A1A1A; line-height: 1.4;">')
      // 确保粗体、斜体、下划线样式
      .replace(/<strong>/g, '<strong style="font-weight: bold; color: #1A1A1A;">')
      .replace(/<em>/g, '<em style="font-style: italic;">')
      .replace(/<u>/g, '<u style="text-decoration: underline;">')
      .replace(/<s>/g, '<s style="text-decoration: line-through;">')
      // 确保链接样式
      .replace(/<a/g, '<a style="color: #2563EB; text-decoration: underline;"')
      // 确保引用样式
      .replace(/<blockquote>/g, '<blockquote style="border-left: 3px solid #07C160; padding: 10px 15px; background: #f0fdf4; margin: 15px 0; border-radius: 0 4px 4px 0; color: #333; font-style: italic;">')
      // 确保有序列表样式
      .replace(/<ol>/g, '<ol style="padding-left: 20px; margin: 15px 0; counter-reset: list-counter;">')
      .replace(/<ol([^>]*)>/g, '<ol$1 style="padding-left: 20px; margin: 15px 0; counter-reset: list-counter;">')
      // 确保无序列表样式
      .replace(/<ul>/g, '<ul style="padding-left: 20px; margin: 15px 0;">')
      .replace(/<ul([^>]*)>/g, '<ul$1 style="padding-left: 20px; margin: 15px 0;">')
      // 确保列表项样式
      .replace(/<li>/g, '<li style="margin-bottom: 8px; color: #333; line-height: 1.6; position: relative;">')
      // 确保图片样式
      .replace(/<img/g, '<img style="width: 100%; border-radius: 4px; margin: 20px 0; display: block;"')
      // 确保代码块样式
      .replace(/<pre>/g, '<pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; overflow-x: auto; font-family: Consolas, Monaco, monospace; font-size: 14px;">')
      .replace(/<code>/g, '<code style="background: #f1f3f4; padding: 2px 4px; border-radius: 3px; font-family: Consolas, Monaco, monospace; font-size: 14px;">')

    return processed
  }, [content])

  const handleCopyToClipboard = async () => {
    try {
      // 获取预览区域的DOM元素
      const previewElement = document.querySelector('.wechat-article-content')
      if (!previewElement) {
        alert('没有找到可复制的内容')
        return
      }

      // 构建完整的文章HTML
      const fullArticleHTML = `
        <article style="max-width: 677px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; font-size: 16px; line-height: 1.6; color: #333; padding: 20px; background: #fff;">
          ${title ? `<h1 style="font-size: 22px; font-weight: bold; margin: 20px 0 15px; color: #1A1A1A; text-align: left; line-height: 1.4;">${title}</h1>` : ''}
          ${author ? `<div style="font-size: 14px; color: #888; margin-bottom: 20px; text-align: left;">作者：${author}</div>` : ''}
          ${coverImage ? `<div style="margin-bottom: 20px; text-align: center;"><img src="${coverImage}" alt="封面图片" style="width: 100%; max-width: 100%; border-radius: 4px; display: block; margin: 0 auto;" /></div>` : ''}
          <div style="color: #333; font-size: 16px; line-height: 1.6;">
            ${processedContent}
          </div>
        </article>
      `

      // 尝试复制富文本（HTML）和纯文本
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const clipboardItem = new ClipboardItem({
            'text/html': new Blob([fullArticleHTML], { type: 'text/html' }),
            'text/plain': new Blob([previewElement.textContent || ''], { type: 'text/plain' })
          })
          await navigator.clipboard.write([clipboardItem])
        } catch (htmlError) {
          // 如果富文本复制失败，尝试仅复制HTML字符串
          await navigator.clipboard.writeText(fullArticleHTML)
        }
      } else {
        // 降级方案：复制HTML字符串
        await navigator.clipboard.writeText(fullArticleHTML)
      }

      // 显示成功提示
      const notification = document.createElement('div')
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>✅</span>
          <div>
            <div style="font-weight: 600;">内容已复制到剪贴板！</div>
            <div style="font-size: 12px; opacity: 0.8;">可直接粘贴到微信公众号编辑器，样式会自动保留</div>
          </div>
        </div>
      `
      notification.className = 'fixed top-4 right-4 bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border z-50 animate-fade-in max-w-sm'
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
      }, 4000)

    } catch (err) {
      console.error('复制失败:', err)

      // 显示错误提示
      const errorNotification = document.createElement('div')
      errorNotification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>❌</span>
          <div>
            <div style="font-weight: 600;">复制失败</div>
            <div style="font-size: 12px; opacity: 0.8;">请手动选择预览区域内容并复制</div>
          </div>
        </div>
      `
      errorNotification.className = 'fixed top-4 right-4 bg-red-50 text-red-800 px-4 py-3 rounded-lg shadow-xl border border-red-200 z-50 max-w-sm'
      document.body.appendChild(errorNotification)

      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification)
        }
      }, 3000)
    }
  }

  const handleViewSource = () => {
    const htmlContent = processedContent
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>HTML源码</title>
            <style>
              body { font-family: monospace; padding: 20px; background: #f5f5f5; }
              pre { background: white; padding: 20px; border-radius: 8px; overflow-x: auto; }
            </style>
          </head>
          <body>
            <h1>HTML源码预览</h1>
            <pre><code>${htmlContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          </body>
        </html>
      `)
      newWindow.document.close()
    }
  }

  const handleSaveDraft = () => {
    const exportData = exportContent()
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || '未命名文章'}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full lg:w-preview flex-shrink-0 space-y-6">
      {/* 导出选项 - 移到顶部 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="font-semibold text-lg mb-4 text-gray-800">导出选项</h2>
        <div className="space-y-3">
          <button
            onClick={handleCopyToClipboard}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
          >
            <Copy className="w-4 h-4 mr-2" />
            复制到剪贴板
          </button>
          <button
            onClick={handleViewSource}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Code className="w-4 h-4 mr-2" />
            查看HTML源码
          </button>
          <button
            onClick={handleSaveDraft}
            className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            保存为草稿
          </button>
        </div>
      </div>

      {/* 微信预览区域 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Smartphone className="text-primary w-5 h-5" />
          <h2 className="font-semibold text-lg text-gray-800">实时预览</h2>
          <Eye className="text-gray-400 w-4 h-4" />
        </div>

        {/* 微信手机预览容器 */}
        <div className="wechat-preview mx-auto">
          <div className="wechat-content mt-10 p-5">
            {/* 文章标题 */}
            {title && (
              <h1 className="text-xl font-bold mb-2 text-gray-800">{title}</h1>
            )}

            {/* 作者信息 */}
            {author && (
              <div className="text-sm text-gray-500 mb-4">
                作者：{author}
              </div>
            )}

            {/* 封面图片 */}
            {coverImage && (
              <div className="mb-4">
                <img
                  src={coverImage}
                  alt="封面图片"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            )}

            {/* 文章内容 */}
            <div
              className="wechat-article-content"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#333'
              }}
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </div>
        </div>
      </div>

      {/* 图片处理工具 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-gray-800">图片处理工具</h2>
          {selectedImageId ? (
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
              已选中图片
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              点击编辑器中的图片进行编辑
            </span>
          )}
        </div>

        {/* 尺寸控制 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            图片尺寸
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              className={`image-size-button ${imageSettings.size === 'original' ? 'active' : ''}`}
              onClick={() => setImageSettings({ size: 'original' })}
            >
              原始
            </button>
            <button
              className={`image-size-button ${imageSettings.size === 'large' ? 'active' : ''}`}
              onClick={() => setImageSettings({ size: 'large' })}
            >
              大图
            </button>
            <button
              className={`image-size-button ${imageSettings.size === 'medium' ? 'active' : ''}`}
              onClick={() => setImageSettings({ size: 'medium' })}
            >
              中等
            </button>
            <button
              className={`image-size-button ${imageSettings.size === 'small' ? 'active' : ''}`}
              onClick={() => setImageSettings({ size: 'small' })}
            >
              小图
            </button>
          </div>
        </div>

        {/* 对齐方式 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            对齐方式
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`image-align-button ${imageSettings.align === 'left' ? 'active' : ''}`}
              onClick={() => setImageSettings({ align: 'left' })}
            >
              <span className="text-xs">左对齐</span>
            </button>
            <button
              className={`image-align-button ${imageSettings.align === 'center' ? 'active' : ''}`}
              onClick={() => setImageSettings({ align: 'center' })}
            >
              <span className="text-xs">居中</span>
            </button>
            <button
              className={`image-align-button ${imageSettings.align === 'right' ? 'active' : ''}`}
              onClick={() => setImageSettings({ align: 'right' })}
            >
              <span className="text-xs">右对齐</span>
            </button>
          </div>
        </div>

        {/* 图片说明 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            图片说明
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
            placeholder="输入图片描述"
            value={imageSettings.caption}
            onChange={(e) => setImageSettings({ caption: e.target.value })}
          />
        </div>

        {/* 图片效果 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            图片效果
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">圆角</span>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={imageSettings.borderRadius}
                  className="w-20"
                  onChange={(e) => setImageSettings({ borderRadius: parseInt(e.target.value) })}
                />
                <span className="text-xs text-gray-500 w-8">{imageSettings.borderRadius}px</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">阴影</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={imageSettings.shadow}
                  className="sr-only peer"
                  onChange={(e) => setImageSettings({ shadow: e.target.checked })}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">边框</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={imageSettings.border}
                  className="sr-only peer"
                  onChange={(e) => setImageSettings({ border: e.target.checked })}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 应用按钮 */}
        <div className="flex space-x-2">
          <button
            className="flex-1 bg-primary text-white py-2 px-3 rounded-md hover:bg-green-600 transition-colors text-sm"
            onClick={() => {
              applyImageSettings()
              // 显示成功提示
              const notification = document.createElement('div')
              notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: #07C160;">✅</span>
                  <span>图片设置已应用</span>
                </div>
              `
              notification.className = 'fixed top-4 right-4 bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border z-50'
              document.body.appendChild(notification)
              setTimeout(() => {
                if (document.body.contains(notification)) {
                  document.body.removeChild(notification)
                }
              }, 2000)
            }}
          >
            应用设置
          </button>
          <button
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm"
            onClick={() => {
              setImageSettings({
                size: 'medium',
                align: 'center',
                caption: '',
                borderRadius: 4,
                shadow: true,
                border: false
              })
            }}
          >
            重置
          </button>
        </div>
      </div>
    </div>
  )
}

export default Preview