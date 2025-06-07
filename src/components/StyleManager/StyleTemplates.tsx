import React from 'react'
import useEditorStore from '../../stores/editorStore'

const StyleTemplates: React.FC = () => {
  const { selectedStyle, setSelectedStyle } = useEditorStore()

  const templates = [
    {
      id: 'circle-number',
      name: '圆形数字标题',
      description: '带圆形背景的数字编号标题',
      preview: '① 标题示例',
      css: 'style-circle-number'
    },
    {
      id: 'left-border',
      name: '左侧边框标题',
      description: '左侧带有彩色边框的标题样式',
      preview: '▌ 标题示例',
      css: 'style-left-border'
    },
    {
      id: 'background-block',
      name: '背景色块标题',
      description: '带背景色块的标题样式',
      preview: '■ 标题示例',
      css: 'style-background-block'
    },
    {
      id: 'gradient-title',
      name: '渐变标题',
      description: '具有渐变背景的现代标题样式',
      preview: '★ 标题示例',
      css: 'style-gradient-title'
    },
    {
      id: 'icon-title',
      name: '图标标题',
      description: '带有图标装饰的标题样式',
      preview: '✦ 标题示例',
      css: 'style-icon-title'
    },
    {
      id: 'underline-title',
      name: '下划线标题',
      description: '带有装饰性下划线的标题样式',
      preview: '━ 标题示例',
      css: 'style-underline-title'
    },
    {
      id: 'frame-title',
      name: '边框标题',
      description: '带有完整边框的标题样式',
      preview: '📋 标题示例',
      css: 'style-frame-title'
    },
    {
      id: 'highlight-title',
      name: '高亮标题',
      description: '带有高亮背景的醒目标题样式',
      preview: '💡 标题示例',
      css: 'style-highlight-title'
    },
    {
      id: 'arrow-title',
      name: '箭头标题',
      description: '带有箭头指向的标题样式',
      preview: '▶ 标题示例',
      css: 'style-arrow-title'
    }
  ]

  const handleTemplateClick = (template: any) => {
    // 设置选中的样式，这会触发编辑器中的useEffect
    setSelectedStyle(template.id)

    // 应用样式到编辑器
    applyStyleToEditor(template)

    // 显示应用成功提示
    const message = `已应用${template.name}样式！`
    const notification = document.createElement('div')
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #07C160; font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: 600; color: #1F2937;">${message}</div>
          <div style="font-size: 12px; color: #6B7280; margin-top: 2px;">
            ${template.description}
          </div>
        </div>
      </div>
    `
    notification.className = 'fixed top-4 right-4 bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border border-gray-200 z-50 max-w-sm'
    notification.style.animation = 'slideInRight 0.3s ease-out'
    document.body.appendChild(notification)

    // 3秒后移除提示
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOutRight 0.3s ease-in'
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }
    }, 3000)

    // 重置选中样式，允许重复应用
    setTimeout(() => {
      setSelectedStyle('default')
    }, 100)
  }

  const applyStyleToEditor = (template: any) => {
    // 获取编辑器实例
    const quillEditor = document.querySelector('.ql-editor')
    if (!quillEditor) return

    // 根据模板类型应用不同的样式
    switch (template.id) {
      case 'circle-number':
        applyCircleNumberStyle(quillEditor)
        break
      case 'left-border':
        applyLeftBorderStyle(quillEditor)
        break
      case 'background-block':
        applyBackgroundBlockStyle(quillEditor)
        break
      case 'gradient-title':
        applyGradientTitleStyle(quillEditor)
        break
      case 'icon-title':
        applyIconTitleStyle(quillEditor)
        break
      case 'underline-title':
        applyUnderlineTitleStyle(quillEditor)
        break
      case 'frame-title':
        applyFrameTitleStyle(quillEditor)
        break
      case 'highlight-title':
        applyHighlightTitleStyle(quillEditor)
        break
      case 'arrow-title':
        applyArrowTitleStyle(quillEditor)
        break
      default:
        console.log('未知的样式模板:', template.id)
    }
  }

  const applyCircleNumberStyle = (editor: Element) => {
    const headings = editor.querySelectorAll('h1, h2, h3')
    headings.forEach((heading, index) => {
      heading.setAttribute('style', `
        position: relative;
        padding-left: 40px;
        margin: 20px 0;
        color: #1a1a1a;
        font-weight: bold;
      `)

      // 移除已存在的样式标记
      const existingMarker = heading.querySelector('[data-style-marker]')
      if (existingMarker) {
        existingMarker.remove()
      }

      // 添加圆形数字
      const numberSpan = document.createElement('span')
      numberSpan.textContent = (index + 1).toString()
      numberSpan.setAttribute('data-style-marker', 'circle-number')
      numberSpan.setAttribute('style', `
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        background: #07c160;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      `)

      heading.insertBefore(numberSpan, heading.firstChild)
    })
  }

  const applyLeftBorderStyle = (editor: Element) => {
    const headings = editor.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => {
      // 移除已存在的样式标记
      const existingMarker = heading.querySelector('[data-style-marker]')
      if (existingMarker) {
        existingMarker.remove()
      }

      heading.setAttribute('style', `
        border-left: 4px solid #07c160;
        padding-left: 15px;
        margin: 20px 0;
        background: #f0fdf4;
        padding-top: 10px;
        padding-bottom: 10px;
        color: #1a1a1a;
        font-weight: bold;
      `)
    })
  }

  const applyBackgroundBlockStyle = (editor: Element) => {
    const headings = editor.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => {
      // 移除已存在的样式标记
      const existingMarker = heading.querySelector('[data-style-marker]')
      if (existingMarker) {
        existingMarker.remove()
      }

      heading.setAttribute('style', `
        background: #07c160;
        color: white;
        padding: 12px 20px;
        margin: 20px 0;
        border-radius: 6px;
        font-weight: bold;
      `)
    })
  }

  const applyGradientTitleStyle = (editor: Element) => {
    const headings = editor.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => {
      // 移除已存在的样式标记
      const existingMarker = heading.querySelector('[data-style-marker]')
      if (existingMarker) {
        existingMarker.remove()
      }

      heading.setAttribute('style', `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        margin: 20px 0;
        border-radius: 8px;
        font-weight: bold;
        text-align: center;
      `)
    })
  }

  const applyIconTitleStyle = (editor: Element) => {
    const headings = editor.querySelectorAll('h1, h2, h3')
    const icons = ['✦', '★', '◆', '●', '▲']

    headings.forEach((heading, index) => {
      // 移除已存在的样式标记
      const existingMarker = heading.querySelector('[data-style-marker]')
      if (existingMarker) {
        existingMarker.remove()
      }

      heading.setAttribute('style', `
        position: relative;
        padding-left: 30px;
        margin: 20px 0;
        color: #1a1a1a;
        font-weight: bold;
      `)

      // 添加图标
      const iconSpan = document.createElement('span')
      iconSpan.textContent = icons[index % icons.length]
      iconSpan.setAttribute('data-style-marker', 'icon')
      iconSpan.setAttribute('style', `
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        color: #07c160;
        font-size: 18px;
        font-weight: bold;
      `)

      heading.insertBefore(iconSpan, heading.firstChild)
    })
  }

  const applyUnderlineTitleStyle = (editor: Element) => {
    const headings = editor.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => {
      // 移除已存在的样式标记
      const existingMarker = heading.querySelector('[data-style-marker]')
      if (existingMarker) {
        existingMarker.remove()
      }

      heading.setAttribute('style', `
        border-bottom: 3px solid #07c160;
        padding-bottom: 8px;
        margin: 20px 0;
        color: #1a1a1a;
        font-weight: bold;
        position: relative;
      `)
    })
  }

  const applyFrameTitleStyle = (editor: Element) => {
    const headings = editor.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => {
      // 移除已存在的样式标记
      const existingMarker = heading.querySelector('[data-style-marker]')
      if (existingMarker) {
        existingMarker.remove()
      }

      heading.setAttribute('style', `
        border: 2px solid #07c160;
        padding: 12px 20px;
        margin: 20px 0;
        border-radius: 8px;
        color: #1a1a1a;
        font-weight: bold;
        text-align: center;
      `)
    })
  }

  const applyHighlightTitleStyle = (editor: Element) => {
    const headings = editor.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => {
      // 移除已存在的样式标记
      const existingMarker = heading.querySelector('[data-style-marker]')
      if (existingMarker) {
        existingMarker.remove()
      }

      heading.setAttribute('style', `
        background: linear-gradient(120deg, #ffd700 0%, #ffed4e 100%);
        color: #1a1a1a;
        padding: 12px 20px;
        margin: 20px 0;
        border-radius: 6px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
      `)
    })
  }

  const applyArrowTitleStyle = (editor: Element) => {
    const headings = editor.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => {
      // 移除已存在的样式标记
      const existingMarker = heading.querySelector('[data-style-marker]')
      if (existingMarker) {
        existingMarker.remove()
      }

      heading.setAttribute('style', `
        position: relative;
        padding-left: 30px;
        margin: 20px 0;
        color: #1a1a1a;
        font-weight: bold;
      `)

      // 添加箭头
      const arrowSpan = document.createElement('span')
      arrowSpan.textContent = '▶'
      arrowSpan.setAttribute('data-style-marker', 'arrow')
      arrowSpan.setAttribute('style', `
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        color: #07c160;
        font-size: 16px;
      `)

      heading.insertBefore(arrowSpan, heading.firstChild)
    })
  }

  const getPreviewStyle = (template: any) => {
    const isSelected = selectedStyle === template.id

    switch (template.id) {
      case 'circle-number':
        return `border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r ${isSelected ? 'ring-2 ring-blue-300' : ''}`
      case 'left-border':
        return `border-l-4 border-green-500 pl-3 py-2 bg-green-50 rounded-r ${isSelected ? 'ring-2 ring-green-300' : ''}`
      case 'background-block':
        return `bg-gray-100 px-3 py-2 rounded ${isSelected ? 'ring-2 ring-gray-300' : ''}`
      case 'gradient-title':
        return `bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded ${isSelected ? 'ring-2 ring-purple-300' : ''}`
      case 'icon-title':
        return `border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-50 rounded-r ${isSelected ? 'ring-2 ring-yellow-300' : ''}`
      case 'underline-title':
        return `border-b-4 border-indigo-500 pb-1 bg-indigo-50 px-2 py-1 rounded-t ${isSelected ? 'ring-2 ring-indigo-300' : ''}`
      case 'frame-title':
        return `border-2 border-emerald-500 px-3 py-2 bg-emerald-50 rounded ${isSelected ? 'ring-2 ring-emerald-300' : ''}`
      case 'highlight-title':
        return `bg-yellow-200 px-3 py-2 rounded border-l-4 border-yellow-600 ${isSelected ? 'ring-2 ring-yellow-300' : ''}`
      case 'arrow-title':
        return `border-l-4 border-red-500 pl-3 py-2 bg-red-50 rounded-r relative ${isSelected ? 'ring-2 ring-red-300' : ''}`
      default:
        return `border-l-4 border-primary pl-3 py-2 bg-green-50 rounded-r ${isSelected ? 'ring-2 ring-green-300' : ''}`
    }
  }

  const getCardStyle = (template: any) => {
    const isSelected = selectedStyle === template.id
    return `border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md hover:scale-105 ${
      isSelected ? 'border-primary shadow-md bg-green-50' : ''
    }`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg text-gray-800">标题样式模板</h2>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          点击应用样式到编辑器
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={getCardStyle(template)}
            onClick={() => handleTemplateClick(template)}
          >
            <div className={`${getPreviewStyle(template)} mb-3 transition-all duration-200`}>
              <h3 className="font-bold text-gray-800 m-0">
                {template.preview}
              </h3>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">{template.name}</h4>
            <p className="text-gray-600 text-sm line-clamp-2">{template.description}</p>
            <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
              <span>🎨</span>
              <span>点击应用样式</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StyleTemplates