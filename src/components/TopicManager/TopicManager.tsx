import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, FileText, Calendar, Tag, Search, ArrowLeft, Eye, Save, RotateCcw, BookOpen } from 'lucide-react'
import useEditorStore from '../../stores/editorStore'

interface Article {
  id: string
  title: string
  content: string
  author?: string
  createDate: Date
  updateDate: Date
  wordCount: number
}

interface Topic {
  id: string
  name: string
  description: string
  color: string
  createDate: Date
  updateDate: Date
  articles: Article[]
}

// 视图模式枚举
type ViewMode = 'topics' | 'articles' | 'reading' | 'editing'

const TopicManager: React.FC = () => {
  const { title, content, author, setTitle, setContent, setAuthor } = useEditorStore()
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('topics')
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [articleSearchTerm, setArticleSearchTerm] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [editingTitle, setEditingTitle] = useState('')
  const [editingAuthor, setEditingAuthor] = useState('')
  const [originalArticle, setOriginalArticle] = useState<Article | null>(null)
  const [newTopic, setNewTopic] = useState({
    name: '',
    description: '',
    color: '#07C160'
  })

  // 预设颜色选项
  const colorOptions = [
    '#07C160', '#0085FF', '#9333EA', '#DC2626', '#D97706',
    '#059669', '#7C3AED', '#DB2777', '#2563EB', '#16A34A'
  ]

  // 加载专题数据
  useEffect(() => {
    const savedTopics = localStorage.getItem('wechat-tool-topics')
    if (savedTopics) {
      try {
        const parsedTopics = JSON.parse(savedTopics).map((topic: any) => ({
          ...topic,
          createDate: new Date(topic.createDate),
          updateDate: new Date(topic.updateDate),
          articles: topic.articles.map((article: any) => ({
            ...article,
            createDate: new Date(article.createDate),
            updateDate: new Date(article.updateDate)
          }))
        }))
        setTopics(parsedTopics)
      } catch (error) {
        console.error('加载专题数据失败:', error)
      }
    }
  }, [])

  // 保存专题数据
  const saveTopics = (updatedTopics: Topic[]) => {
    try {
      localStorage.setItem('wechat-tool-topics', JSON.stringify(updatedTopics));
      setTopics(updatedTopics);
    } catch (error) {
      console.error('保存专题数据失败:', error);
      showNotification('❌', '保存失败，请重试', '#DC2626');
    }
  };

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

  // 创建新专题
  const handleCreateTopic = () => {
    if (!newTopic.name.trim()) {
      showNotification('⚠️', '请输入专题名称', '#F59E0B')
      return
    }

    const topic: Topic = {
      id: Date.now().toString(),
      name: newTopic.name.trim(),
      description: newTopic.description.trim(),
      color: newTopic.color,
      createDate: new Date(),
      updateDate: new Date(),
      articles: []
    }

    const updatedTopics = [...topics, topic]
    saveTopics(updatedTopics)

    setNewTopic({ name: '', description: '', color: '#07C160' })
    setIsCreating(false)
    showNotification('✅', '专题创建成功', '#07C160')
  }

  // 编辑专题
  const handleEditTopic = (topic: Topic) => {
    setNewTopic({
      name: topic.name,
      description: topic.description,
      color: topic.color
    })
    setSelectedTopic(topic)
    setIsEditing(true)
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (!selectedTopic || !newTopic.name.trim()) {
      showNotification('⚠️', '请输入专题名称', '#F59E0B')
      return
    }

    const updatedTopics = topics.map(topic =>
      topic.id === selectedTopic.id
        ? {
            ...topic,
            name: newTopic.name.trim(),
            description: newTopic.description.trim(),
            color: newTopic.color,
            updateDate: new Date()
          }
        : topic
    )

    saveTopics(updatedTopics)
    setNewTopic({ name: '', description: '', color: '#07C160' })
    setSelectedTopic(null)
    setIsEditing(false)
    showNotification('✅', '专题更新成功', '#07C160')
  }

  // 删除专题
  const handleDeleteTopic = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId)
    if (!topic) return

    if (topic.articles.length > 0) {
      if (!confirm(`专题"${topic.name}"包含${topic.articles.length}篇文章，确定要删除吗？`)) {
        return
      }
    } else {
      if (!confirm(`确定要删除专题"${topic.name}"吗？`)) {
        return
      }
    }

    const updatedTopics = topics.filter(t => t.id !== topicId)
    saveTopics(updatedTopics)
    showNotification('✅', '专题删除成功', '#07C160')
  }

  // 添加当前文章到专题
  const handleAddCurrentArticle = (topicId: string) => {
    console.log('添加文章到专题，当前内容:', { title, content, author })

    // 检查是否有内容
    if (!content || content.trim() === '' || content.trim() === '<p><br></p>') {
      showNotification('⚠️', '当前编辑器没有内容', '#F59E0B')
      return
    }

    // 提取纯文本用于计算字数和生成标题
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    if (!plainText.trim()) {
      showNotification('⚠️', '当前编辑器没有有效内容', '#F59E0B')
      return
    }

    // 生成文章标题：优先使用设置的标题，否则从内容提取
    let articleTitle = title && title.trim() ? title.trim() : ''

    if (!articleTitle) {
      // 从内容中提取第一行作为标题
      const firstLine = plainText.split('\n')[0]?.trim() || ''
      articleTitle = firstLine.length > 0 ? firstLine : '未命名文章'
    }

    // 限制标题长度
    if (articleTitle.length > 50) {
      articleTitle = articleTitle.substring(0, 50) + '...'
    }

    // 检查是否已存在相同内容的文章（防止重复添加）
    const targetTopic = topics.find(t => t.id === topicId)
    if (targetTopic) {
      const isDuplicate = targetTopic.articles.some(article => {
        // 比较内容和标题是否相同
        return article.content === content && article.title === articleTitle
      })

      if (isDuplicate) {
        showNotification('⚠️', '该文章已存在于此专题中', '#F59E0B')
        return
      }
    }

    const article: Article = {
      id: Date.now().toString(),
      title: articleTitle,
      content: content,
      author: author,
      createDate: new Date(),
      updateDate: new Date(),
      wordCount: plainText.length,
    }

    console.log('创建的文章对象:', article)

    const updatedTopics = topics.map(topic =>
      topic.id === topicId
        ? {
            ...topic,
            articles: [...topic.articles, article],
            updateDate: new Date()
          }
        : topic
    )

    saveTopics(updatedTopics)
    showNotification('✅', `文章"${articleTitle}"已添加到专题`, '#07C160')
  }

  // 查看专题文章列表
  const handleViewTopicArticles = (topic: Topic) => {
    setSelectedTopic(topic)
    setViewMode('articles')
    setArticleSearchTerm('')
  }

  // 查看文章详情
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article)
    setViewMode('reading')
  }

  // 编辑文章
  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article)
    setOriginalArticle({ ...article })
    setEditingTitle(article.title)
    setEditingContent(article.content)
    setEditingAuthor(article.author || '')
    setViewMode('editing')
  }

  // 保存文章编辑
  const handleSaveArticleEdit = () => {
    if (!selectedArticle || !selectedTopic) return

    // 提取纯文本用于计算字数
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = editingContent
    const plainText = tempDiv.textContent || tempDiv.innerText || ''

    const updatedArticle: Article = {
      ...selectedArticle,
      title: editingTitle.trim() || '未命名文章',
      content: editingContent,
      author: editingAuthor,
      updateDate: new Date(),
      wordCount: plainText.length,
    }

    const updatedTopics = topics.map(topic =>
      topic.id === selectedTopic.id
        ? {
            ...topic,
            articles: topic.articles.map(article =>
              article.id === selectedArticle.id ? updatedArticle : article
            ),
            updateDate: new Date()
          }
        : topic
    )

    saveTopics(updatedTopics)
    setSelectedArticle(updatedArticle)
    setSelectedTopic({ ...selectedTopic, articles: selectedTopic.articles.map(article =>
      article.id === selectedArticle.id ? updatedArticle : article
    )})
    setViewMode('reading')
    showNotification('✅', '文章保存成功', '#07C160')
  }

  // 撤销文章编辑
  const handleCancelArticleEdit = () => {
    if (originalArticle) {
      setEditingTitle(originalArticle.title)
      setEditingContent(originalArticle.content)
      setEditingAuthor(originalArticle.author || '')
    }
    setViewMode('reading')
  }

  // 返回上一级视图
  const handleGoBack = () => {
    switch (viewMode) {
      case 'articles':
        setViewMode('topics')
        setSelectedTopic(null)
        break
      case 'reading':
      case 'editing':
        setViewMode('articles')
        setSelectedArticle(null)
        setOriginalArticle(null)
        break
      default:
        setViewMode('topics')
    }
  }

  // 删除文章
  const handleDeleteArticle = (articleId: string) => {
    if (!selectedTopic) return

    if (window.confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      const updatedTopics = topics.map(topic =>
        topic.id === selectedTopic.id
          ? {
              ...topic,
              articles: topic.articles.filter(article => article.id !== articleId),
              updateDate: new Date()
            }
          : topic
      )

      saveTopics(updatedTopics)
      setSelectedTopic({
        ...selectedTopic,
        articles: selectedTopic.articles.filter(article => article.id !== articleId)
      })
      showNotification('✅', '文章删除成功', '#07C160')
    }
  }

  // 过滤专题
  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 过滤文章
  const filteredArticles = selectedTopic ? selectedTopic.articles.filter(article =>
    article.title.toLowerCase().includes(articleSearchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(articleSearchTerm.toLowerCase())
  ) : []

  // 渲染不同的视图模式
  const renderContent = () => {
    switch (viewMode) {
      case 'topics':
        return renderTopicsView()
      case 'articles':
        return renderArticlesView()
      case 'reading':
        return renderReadingView()
      case 'editing':
        return renderEditingView()
      default:
        return renderTopicsView()
    }
  }

  // 渲染专题列表视图
  const renderTopicsView = () => (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">专题管理</h2>
          <p className="text-sm text-gray-600 mt-1">
            创建和管理文章专题，按主题组织你的内容
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建专题
        </button>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="搜索专题..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 专题统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">总专题数</p>
              <p className="text-2xl font-bold">{topics.length}</p>
            </div>
            <Tag className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">总文章数</p>
              <p className="text-2xl font-bold">{topics.reduce((sum, topic) => sum + topic.articles.length, 0)}</p>
            </div>
            <FileText className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">本月新增</p>
              <p className="text-2xl font-bold">
                {topics.filter(topic => {
                  const now = new Date()
                  const topicDate = new Date(topic.createDate)
                  return topicDate.getMonth() === now.getMonth() && topicDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>
      {/* 专题列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* 专题头部 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: topic.color }}
                ></div>
                <h3 className="font-semibold text-gray-800 truncate">
                  {topic.name}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditTopic(topic)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="编辑专题"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTopic(topic.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="删除专题"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 专题描述 */}
            {topic.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {topic.description}
              </p>
            )}

            {/* 专题统计 */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {topic.articles.length} 篇文章
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {topic.updateDate.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={() => handleAddCurrentArticle(topic.id)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                添加当前文章
              </button>
              <button
                onClick={() => handleViewTopicArticles(topic)}
                className="flex-1 bg-primary text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors"
              >
                查看文章
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {filteredTopics.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {searchTerm ? '没有找到匹配的专题' : '还没有创建任何专题'}
          </p>
          <p className="text-sm text-gray-400">
            {searchTerm ? '尝试使用其他关键词搜索' : '创建专题来组织你的文章内容'}
          </p>
        </div>
      )}

      {/* 创建/编辑专题模态框 */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? '编辑专题' : '创建新专题'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  专题名称 *
                </label>
                <input
                  type="text"
                  value={newTopic.name}
                  onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="输入专题名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  专题描述
                </label>
                <textarea
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                  placeholder="输入专题描述（可选）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  专题颜色
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTopic({ ...newTopic, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newTopic.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false)
                  setIsEditing(false)
                  setSelectedTopic(null)
                  setNewTopic({ name: '', description: '', color: '#07C160' })
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={isEditing ? handleSaveEdit : handleCreateTopic}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                {isEditing ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // 渲染文章列表视图
  const renderArticlesView = () => (
    <div className="space-y-6">
      {/* 头部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedTopic?.color }}
              ></div>
              {selectedTopic?.name} - 文章列表
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              共 {selectedTopic?.articles.length || 0} 篇文章
            </p>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="搜索文章..."
          value={articleSearchTerm}
          onChange={(e) => setArticleSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 文章列表 */}
      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">{article.title}</h3>
                <div className="text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.createDate.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {article.wordCount} 字
                    </span>
                    {article.author && (
                      <span>作者: {article.author}</span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 line-clamp-2">
                  {article.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleViewArticle(article)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title="查看文章"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditArticle(article)}
                  className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                  title="编辑文章"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteArticle(article.id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="删除文章"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {articleSearchTerm ? '没有找到匹配的文章' : '该专题还没有文章'}
          </p>
          <p className="text-sm text-gray-400">
            {articleSearchTerm ? '尝试使用其他关键词搜索' : '在编辑器中创建内容后添加到此专题'}
          </p>
        </div>
      )}
    </div>
  )

  // 渲染文章阅读视图
  const renderReadingView = () => (
    <div className="space-y-6">
      {/* 头部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">阅读文章</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedTopic?.name} / {selectedArticle?.title}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleEditArticle(selectedArticle!)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          编辑文章
        </button>
      </div>

      {/* 文章信息 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedArticle?.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              创建于 {selectedArticle?.createDate.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {selectedArticle?.wordCount} 字
            </span>
            {selectedArticle?.author && (
              <span>作者: {selectedArticle.author}</span>
            )}
            {selectedArticle?.updateDate && selectedArticle.updateDate.getTime() !== selectedArticle.createDate.getTime() && (
              <span className="flex items-center gap-1">
                <Edit3 className="w-4 h-4" />
                更新于 {selectedArticle.updateDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: selectedArticle?.content || '' }}
        />
      </div>
    </div>
  )

  // 渲染文章编辑视图
  const renderEditingView = () => (
    <div className="space-y-6">
      {/* 头部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">编辑文章</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedTopic?.name} / {selectedArticle?.title}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancelArticleEdit}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            撤销
          </button>
          <button
            onClick={handleSaveArticleEdit}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>

      {/* 编辑表单 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            文章标题
          </label>
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="输入文章标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            作者
          </label>
          <input
            type="text"
            value={editingAuthor}
            onChange={(e) => setEditingAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="输入作者名称（可选）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            文章内容
          </label>
          <textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={20}
            placeholder="输入文章内容"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
}

export default TopicManager