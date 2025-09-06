import { FC, useState, useEffect } from 'react'
import { Card, Button, Select, message, Spin } from 'antd'
import { ArrowLeftOutlined, MobileOutlined, DesktopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getArticleList } from '@/api'
import type { ArticleDataType } from './types'

const ArticlePreview: FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState<ArticleDataType[]>([])
  const [selectedArticle, setSelectedArticle] = useState<ArticleDataType | null>(null)
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const data = await getArticleList({ pageSize: 100, pageNum: 1 })
      setArticles(data.records || [])
      if (data.records && data.records.length > 0) {
        setSelectedArticle(data.records[0])
      }
    } catch (error) {
      message.error('获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleArticleChange = (articleId: number) => {
    const article = articles.find(item => item.id === articleId)
    setSelectedArticle(article || null)
  }

  const renderContent = (content: string) => {
    if (!content) {
      return <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>暂无内容</div>
    }

    return (
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          lineHeight: '1.8',
          fontSize: viewMode === 'mobile' ? '16px' : '14px',
          color: '#333',
          wordBreak: 'break-word'
        }}
      />
    )
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 头部工具栏 */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/data/article')}
            >
              返回文章列表
            </Button>

            <Select
              style={{ width: 300 }}
              placeholder="选择要预览的文章"
              value={selectedArticle?.id}
              onChange={handleArticleChange}
              loading={loading}
            >
              {articles.map(article => (
                <Select.Option key={article.id} value={article.id}>
                  {article.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              type={viewMode === 'mobile' ? 'primary' : 'default'}
              icon={<MobileOutlined />}
              onClick={() => setViewMode('mobile')}
            >
              移动端
            </Button>
            <Button
              type={viewMode === 'desktop' ? 'primary' : 'default'}
              icon={<DesktopOutlined />}
              onClick={() => setViewMode('desktop')}
            >
              桌面端
            </Button>
          </div>
        </div>
      </Card>

      {/* 预览区域 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: viewMode === 'mobile' ? '375px' : '100%',
            maxWidth: viewMode === 'mobile' ? '375px' : '1200px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: viewMode === 'mobile' ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          {/* 文章头部 */}
          {selectedArticle && (
            <div style={{
              padding: viewMode === 'mobile' ? '16px' : '24px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <h1 style={{
                margin: 0,
                fontSize: viewMode === 'mobile' ? '20px' : '24px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {selectedArticle.name}
              </h1>
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#999',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>保司ID: {selectedArticle.companyId}</span>
                <span>分类ID: {selectedArticle.categoryId}</span>
                <span>{new Date(selectedArticle.createTime).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* 文章内容 */}
          <div style={{
            padding: viewMode === 'mobile' ? '16px' : '24px',
            minHeight: '400px'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            ) : selectedArticle ? (
              renderContent(selectedArticle.content)
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                请选择要预览的文章
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端模拟器边框 */}
      {viewMode === 'mobile' && (
        <style>
          {`
            @media (max-width: 768px) {
              .mobile-preview {
                margin: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
              }
            }
          `}
        </style>
      )}
    </div>
  )
}

export default ArticlePreview