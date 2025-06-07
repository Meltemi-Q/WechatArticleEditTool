/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#07C160',      // 微信绿色 - 主要按钮、选中状态
        secondary: '#0085FF',    // 蓝色 - 次要操作、链接
        dark: '#1A1A1A',        // 深色 - 页脚、深色文本
        light: '#F5F7FA',       // 浅色 - 背景、预览区
      },
      borderRadius: {
        'sm': '6px',           // 小元素圆角
        'md': '8px',           // 卡片圆角
        'lg': '12px',          // 大卡片圆角
        'xl': '16px',          // 预览区圆角
      },
      spacing: {
        'sidebar': '256px',     // 左侧边栏宽度
        'preview': '320px',     // 右侧预览区宽度
      },
      width: {
        'sidebar': '256px',     // 左侧边栏宽度
        'preview': '320px',     // 右侧预览区宽度
      },
      animation: {
        'bounce-in': 'bounceIn 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
} 