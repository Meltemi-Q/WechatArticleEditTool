import React from 'react'
import { MessageSquare, History, Settings, Download } from 'lucide-react'
import useEditorStore from '../../stores/editorStore'
import useSettingsStore from '../../stores/settingsStore'

const Header: React.FC = () => {
  const { setActiveTab, content, title, author, getAutoSaveStatus } = useEditorStore()
  const { exportFormat, includeStyles, autoSave } = useSettingsStore()

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

  const handleHistoryClick = () => {
    setActiveTab('history')
    showNotification('📚', '已切换到历史版本页面', '#0085FF')
  }

  const handleSettingsClick = () => {
    setActiveTab('settings')
    showNotification('⚙️', '已切换到系统设置页面', '#6B7280')
  }

  // 转换HTML为Markdown
  const htmlToMarkdown = (html: string): string => {
    let markdown = html

    // 移除HTML标签并转换为Markdown
    markdown = markdown
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n')
      .replace(/<[^>]*>/g, '') // 移除剩余的HTML标签
      .replace(/\n{3,}/g, '\n\n') // 合并多个换行
      .trim()

    return markdown
  }

  const handleExportClick = () => {
    try {
      console.log('开始导出，当前内容:', content)
      console.log('导出格式:', exportFormat)
      console.log('包含样式:', includeStyles)

      if (!content || content.trim() === '') {
        showNotification('⚠️', '请先编写文章内容', '#F59E0B')
        return
      }

      let exportData: string
      let fileName: string
      let mimeType: string
      let fileExtension: string

      // 获取完整的HTML内容（包含样式）
      const getStyledHtmlContent = () => {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || '微信文章'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 677px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        h1 { font-size: 1.8em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.3em; }
        p { margin-bottom: 1em; }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 15px auto;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        ul, ol { padding-left: 1.5em; margin-bottom: 1em; }
        li { margin-bottom: 0.5em; }
        blockquote {
            border-left: 4px solid #07C160;
            padding-left: 1em;
            margin: 1em 0;
            color: #666;
            background-color: #f9f9f9;
            padding: 1em;
            border-radius: 4px;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        strong { color: #2c3e50; }
        em { color: #7f8c8d; }
    </style>
</head>
<body>
    <h1>${title || '未命名文章'}</h1>
    <p style="color: #666; font-size: 0.9em; margin-bottom: 2em;">作者：${author || '未知作者'}</p>
    ${content}
</body>
</html>`
      }

      switch (exportFormat) {
        case 'html':
          exportData = includeStyles ? getStyledHtmlContent() : content
          fileName = `${title || '微信文章'}-${new Date().toISOString().split('T')[0]}.html`
          mimeType = 'text/html;charset=utf-8'
          fileExtension = 'html'
          break

        case 'markdown':
          exportData = htmlToMarkdown(content)
          fileName = `${title || '微信文章'}-${new Date().toISOString().split('T')[0]}.md`
          mimeType = 'text/markdown;charset=utf-8'
          fileExtension = 'md'
          break

        case 'json':
          const jsonData = {
            title: title || '未命名文章',
            author: author || '未知作者',
            content: content,
            htmlContent: getStyledHtmlContent(),
            markdownContent: htmlToMarkdown(content),
            wordCount: content.replace(/<[^>]*>/g, '').length,
            createDate: new Date().toISOString(),
            exportFormat: 'json',
            includeStyles: includeStyles,
            exportSettings: {
              exportFormat,
              includeStyles
            }
          }
          exportData = JSON.stringify(jsonData, null, 2)
          fileName = `${title || '微信文章'}-${new Date().toISOString().split('T')[0]}.json`
          mimeType = 'application/json;charset=utf-8'
          fileExtension = 'json'
          break

        default:
          exportData = getStyledHtmlContent()
          fileName = `${title || '微信文章'}-${new Date().toISOString().split('T')[0]}.html`
          mimeType = 'text/html;charset=utf-8'
          fileExtension = 'html'
      }

      console.log('导出数据长度:', exportData.length)
      console.log('文件名:', fileName)

      // 复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(exportData).then(() => {
          showNotification('✅', `${fileExtension.toUpperCase()}内容已复制到剪贴板`, '#07C160')
        }).catch((clipboardError: unknown) => {
          console.error('剪贴板复制失败:', clipboardError)
          fallbackCopyToClipboard(exportData)
        })
      } else {
        fallbackCopyToClipboard(exportData)
      }

      // 下载文件
      const blob = new Blob([exportData], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showNotification('📥', `${fileExtension.toUpperCase()}文件已下载`, '#07C160')

    } catch (error: unknown) {
      console.error('导出失败详细错误:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      showNotification('❌', `导出失败：${errorMessage}`, '#DC2626')
    }
  }

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      showNotification('✅', '文章已复制到剪贴板', '#07C160')
    } catch (err) {
      showNotification('❌', '复制失败，请手动复制', '#DC2626')
    }

    document.body.removeChild(textArea)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo区域 */}
        <div className="flex items-center space-x-3">
          <MessageSquare className="text-primary text-3xl" />
          <h1 className="text-xl font-bold text-gray-800">
            微信公众号文章排版工具
          </h1>
        </div>

        {/* 自动保存状态 */}
        {autoSave && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="auto-save-status">{getAutoSaveStatus()}</span>
          </div>
        )}

        {/* 操作按钮区域 */}
        <div className="flex items-center space-x-4">
          <button
            className="header-button header-button--secondary"
            onClick={handleHistoryClick}
            title="查看历史版本"
          >
            <History className="w-4 h-4 mr-2" />
            历史版本
          </button>
          <button
            className="header-button header-button--secondary"
            onClick={handleSettingsClick}
            title="系统设置"
          >
            <Settings className="w-4 h-4 mr-2" />
            设置
          </button>
          <button
            className="header-button header-button--primary"
            onClick={handleExportClick}
            title="导出文章到剪贴板和下载HTML文件"
          >
            <Download className="w-4 h-4 mr-2" />
            导出文章
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header