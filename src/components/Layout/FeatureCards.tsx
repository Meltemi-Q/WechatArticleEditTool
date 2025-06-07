import React from 'react'
import { Edit3, Image, Palette, FolderOpen } from 'lucide-react'

const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: Edit3,
      title: '富文本编辑',
      description: '基于Quill.js的强大编辑器，支持Markdown，实时预览功能',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Image,
      title: '智能图片处理',
      description: '自动优化图片尺寸，智能压缩，添加图注和水印',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Palette,
      title: '样式管理',
      description: '预设标题样式，颜色主题，一键应用专业排版',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      icon: FolderOpen,
      title: '专题管理',
      description: '组织历史文章，生成系列专题模板，批量操作',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {features.map((feature, index) => (
        <div key={index} className="feature-card animate-fade-in">
          <div className={`w-12 h-12 rounded-full ${feature.iconBg} flex items-center justify-center mb-4`}>
            <feature.icon className={`${feature.iconColor} text-xl`} />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            {feature.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  )
}

export default FeatureCards 