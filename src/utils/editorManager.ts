// 全局编辑器实例管理器
class EditorManager {
  private static instance: EditorManager
  private quillInstance: any = null
  private callbacks: Array<(quill: any) => void> = []

  private constructor() {}

  static getInstance(): EditorManager {
    if (!EditorManager.instance) {
      EditorManager.instance = new EditorManager()
    }
    return EditorManager.instance
  }

  // 注册Quill实例
  registerQuill(quill: any) {
    this.quillInstance = quill
    console.log('Quill实例已注册:', quill)

    // 执行等待的回调
    this.callbacks.forEach(callback => {
      try {
        callback(quill)
      } catch (error) {
        console.error('执行编辑器回调失败:', error)
      }
    })
    this.callbacks = []
  }

  // 获取Quill实例
  getQuill(): any {
    return this.quillInstance
  }

  // 等待Quill实例可用
  waitForQuill(callback: (quill: any) => void) {
    if (this.quillInstance) {
      callback(this.quillInstance)
    } else {
      this.callbacks.push(callback)
    }
  }

  // 插入图片到编辑器
  insertImage(imageUrl: string, _imageName?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.waitForQuill((quill) => {
        try {
          // 验证图片URL
          if (!imageUrl || typeof imageUrl !== 'string') {
            throw new Error('无效的图片URL')
          }

          const range = quill.getSelection(true)
          const index = range ? range.index : quill.getLength()

          // 创建图片元素并预加载
          const img = new Image()
          img.onload = () => {
            try {
              // 插入图片
              quill.insertEmbed(index, 'image', imageUrl)

              // 等待DOM更新后设置样式
              setTimeout(() => {
                const insertedImg = quill.root.querySelector(`img[src="${imageUrl}"]`)
                if (insertedImg) {
                  // 设置图片样式
                  insertedImg.style.cssText = `
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 10px auto;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                  `

                  // 添加图片ID用于后续管理
                  insertedImg.setAttribute('data-image-id', Date.now().toString())
                }

                // 在图片后添加换行
                quill.insertText(index + 1, '\n')

                // 设置光标位置到图片后
                quill.setSelection(index + 2, 0)

                console.log('图片插入成功:', imageUrl)
                resolve(true)
              }, 100)
            } catch (error) {
              console.error('插入图片DOM操作失败:', error)
              reject(error)
            }
          }

          img.onerror = () => {
            console.error('图片加载失败:', imageUrl)
            reject(new Error('图片加载失败'))
          }

          // 开始加载图片
          img.src = imageUrl

        } catch (error) {
          console.error('插入图片失败:', error)
          reject(error)
        }
      })
    })
  }

  // 获取编辑器内容
  getContent(): string {
    if (this.quillInstance) {
      return this.quillInstance.root.innerHTML
    }
    return ''
  }

  // 设置编辑器内容
  setContent(content: string) {
    if (this.quillInstance) {
      this.quillInstance.root.innerHTML = content
    }
  }

  // 获取纯文本内容
  getText(): string {
    if (this.quillInstance) {
      return this.quillInstance.getText()
    }
    return ''
  }

  // 获取选中的文本
  getSelection() {
    if (this.quillInstance) {
      return this.quillInstance.getSelection()
    }
    return null
  }

  // 应用格式到选中文本
  formatText(index: number, length: number, format: any) {
    if (this.quillInstance) {
      this.quillInstance.formatText(index, length, format)
    }
  }

  // 插入文本
  insertText(index: number, text: string, format?: any) {
    if (this.quillInstance) {
      this.quillInstance.insertText(index, text, format)
    }
  }

  // 清理实例
  cleanup() {
    this.quillInstance = null
    this.callbacks = []
  }
}

export default EditorManager.getInstance()
