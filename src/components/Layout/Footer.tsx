import React from 'react'
import { MessageSquare, Github, Heart } from 'lucide-react'

const Footer: React.FC = () => {
  const techStack = [
    { name: 'React', icon: '⚛️' },
    { name: 'TypeScript', icon: '🟦' },
    { name: 'Vite', icon: '⚡' },
    { name: 'Tailwind', icon: '🎨' },
    { name: 'Quill.js', icon: '📝' },
    { name: 'Zustand', icon: '🐻' }
  ]

  return (
    <footer className="bg-dark text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* 主要内容区域 */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          {/* 品牌信息 */}
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <MessageSquare className="text-primary text-2xl" />
            <div>
              <h3 className="text-xl font-bold">微信公众号文章排版工具</h3>
              <p className="text-gray-400 text-sm mt-1">
                专业的微信公众号文章排版解决方案
              </p>
            </div>
          </div>

          {/* 链接区域 */}
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              title="GitHub"
            >
              <Github className="text-xl" />
            </a>
            <div className="flex items-center text-gray-300">
              <span className="text-sm">Made with</span>
              <Heart className="text-red-500 mx-1 text-sm" />
              <span className="text-sm">for 微信公众号作者</span>
            </div>
          </div>
        </div>

        {/* 技术栈展示 */}
        <div className="border-t border-gray-700 pt-8">
          <h4 className="text-lg font-semibold mb-4 text-center">技术栈</h4>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg">{tech.icon}</span>
                <span className="text-sm font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 版权信息 */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 微信公众号文章排版工具. 基于 MIT License 开源.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            纯前端架构 · 数据本地存储 · 完全免费使用
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 