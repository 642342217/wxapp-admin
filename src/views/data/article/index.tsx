import type { ColumnsType } from 'antd/es/table'
import { type FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Row,
  Col,
  message,
  Switch,
  Image,
  InputNumber,
  Tooltip,
  Upload
} from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined, MinusOutlined, EditOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons'
import { PageWrapper } from '@/components/Page'
import { getArticleList, addArticle, updateArticle, deleteArticle, updateArticleStatus, updateArticleContent, uploadDocument, uploadAudio, uploadPdf, uploadImage } from '@/api'
import type { ArticleDataType, ArticlePageParams, ArticlePageResult } from './types'
import RichTextEditor from '@/components/RichTextEditor'
import { renderContent, getContentPreview } from '@/utils/contentRenderer'

const ArticleManagement: FC = () => {
  const navigate = useNavigate()
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<ArticleDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [searchForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [searchParams, setSearchParams] = useState<ArticlePageParams>({
    name: '',
    pageSize: 10,
    pageNum: 1
  })

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<ArticleDataType | null>(null)
  const [richTextModalVisible, setRichTextModalVisible] = useState(false)
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [currentContent, setCurrentContent] = useState('')
  const [editingRecord, setEditingRecord] = useState<ArticleDataType | null>(null)

  const columns: ColumnsType<ArticleDataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: 80
    },
    {
      title: '保司ID',
      dataIndex: 'companyId',
      align: 'center',
      width: 100
    },
    {
      title: '图标',
      dataIndex: 'icon',
      align: 'center',
      width: 100,
      render: (icon: string) => (
        <Image
          width={40}
          height={40}
          src={icon}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      )
    },
    {
      title: '文章标题',
      dataIndex: 'name',
      align: 'center',
      width: 200
    },
    {
      title: '分类ID',
      dataIndex: 'categoryId',
      align: 'center',
      width: 100
    },
    {
      title: '内容',
      dataIndex: 'content',
      align: 'center',
      width: 200,
      render: (content: string, record: ArticleDataType) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <Button
              size="small"
              // type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditContent(record)}
            >编辑内容</Button>
            {/* <Tooltip title="预览内容">
              <Button
                size="small"
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handlePreviewContent(record)}
              />
            </Tooltip> */}
          </Space>
        </Space>
      )
    },
    {
      title: '排序',
      dataIndex: 'sort',
      align: 'center',
      width: 150,
      render: (sort: number, record: ArticleDataType) => (
        <Space.Compact>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleSortChange(record, Math.max(0, sort - 1))}
          />
          <InputNumber
            size="small"
            value={sort}
            min={0}
            max={9999}
            controls={false}
            style={{ width: 60 }}
            onBlur={(e) => {
              const value = Number(e.target.value)
              if (!isNaN(value) && value !== sort) {
                handleSortChange(record, value)
              }
            }}
            onPressEnter={(e) => {
              const value = Number((e.target as HTMLInputElement).value)
              if (!isNaN(value) && value !== sort) {
                handleSortChange(record, value)
              }
            }}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleSortChange(record, Math.min(9999, sort + 1))}
          />
        </Space.Compact>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (status: number, record: ArticleDataType) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(record, checked)}
          checkedChildren="启用"
          unCheckedChildren="未启用"
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record: ArticleDataType) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            修改
          </Button>
        </Space>
      )
    }
  ]

  useEffect(() => {
    fetchData()
  }, [searchParams])

  async function fetchData() {
    setTableLoading(true)
    try {
      const data = await getArticleList(searchParams)
      const { records, total } = data as ArticlePageResult
      setTableData(records)
      setTableTotal(total)
    } catch (error) {
      message.error('获取文章列表失败')
    } finally {
      setTableLoading(false)
    }
  }

  function handleSearch() {
    const values = searchForm.getFieldsValue()
    setSearchParams({
      ...searchParams,
      name: values.name || '',
      pageNum: 1
    })
  }

  function handleReset() {
    searchForm.resetFields()
    setSearchParams({
      ...searchParams,
      name: '',
      pageNum: 1
    })
  }

  function handlePageChange(page: number, pageSize: number) {
    setSearchParams({
      ...searchParams,
      pageNum: page,
      pageSize
    })
  }

  function handleAdd() {
    setAddModalVisible(true)
    editForm.resetFields()
  }

  function handleEdit(record: ArticleDataType) {
    setCurrentRecord(record)
    setEditModalVisible(true)
    editForm.setFieldsValue(record)
  }

  function handleStatusChange(record: ArticleDataType, checked: boolean) {
    const newStatus = checked ? 1 : 0
    const action = newStatus === 1 ? '启用' : '禁用'

    Modal.confirm({
      title: `确认${action}`,
      content: `确定要${action}文章"${record.name}"吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await updateArticleStatus({ id: record.id, status: newStatus })
          message.success(`${action}成功`)
          fetchData()
        } catch (error) {
          message.error(`${action}失败`)
        }
      }
    })
  }

  async function handleSortChange(record: ArticleDataType, newSort: number) {
    try {
      await updateArticleSort({
        id: record.id,
        sort: newSort
      })
      message.success('排序更新成功')
      fetchData()
    } catch (error) {
      message.error('排序更新失败')
    }
  }

  function handleEditContent(record: ArticleDataType) {
    setEditingRecord(record)
    setCurrentContent(record.content || '')
    setRichTextModalVisible(true)
  }

  function handlePreviewContent(record: ArticleDataType) {
    setEditingRecord(record)
    setCurrentContent(record.content || '')
    setPreviewModalVisible(true)
  }

  function handleRichTextSave(content: string) {
    if (editingRecord) {
      // 这里调用保存内容的API
      updateArticleContent({
        id: editingRecord.id,
        content: content
      }).then(() => {
        message.success('内容保存成功')
        setRichTextModalVisible(false)
        fetchData()
      }).catch(() => {
        message.error('内容保存失败')
      })
    }
  }

  async function handleModalOk() {
    try {
      if (addModalVisible) {
        // 新增文章
        const values = await editForm.validateFields()
        await addArticle({
          name: values.name,
          companyId: Number(values.companyId),
          categoryId: Number(values.categoryId),
          icon: values.icon,
          pdfFile: values.pdfFile || '',
          wordFile: values.wordFile || '',
          mp3File: values.mp3File || ''
        })
        message.success('新增文章成功')
        setAddModalVisible(false)
        editForm.resetFields()
        fetchData()
      } else if (editModalVisible) {
        // 编辑文章
        const values = await editForm.validateFields()
        await updateArticle({
          id: currentRecord?.id,
          name: values.name,
          companyId: Number(values.companyId),
          categoryId: Number(values.categoryId),
          icon: values.icon,
          pdfFile: values.pdfFile || '',
          wordFile: values.wordFile || '',
          mp3File: values.mp3File || ''
        })
        message.success('编辑文章成功')
        setEditModalVisible(false)
        fetchData()
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('请检查表单输入')
      } else {
        message.error('操作失败')
      }
    }
  }

  function handleModalCancel() {
    setEditModalVisible(false)
    setAddModalVisible(false)
    setCurrentRecord(null)
  }

  return (
    <PageWrapper>
      {/* 搜索区域 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="name" label="文章标题">
            <Input placeholder="请输入文章标题" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 内容区域 */}
      <Card bordered={false}>
        {/* 操作按钮区域 */}
        <Row style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增文章
              </Button>
              {/* <Button icon={<EyeOutlined />} onClick={() => navigate('/data/article/preview')}>
                预览调试
              </Button> */}
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tableData}
          loading={tableLoading}
          pagination={{
            current: searchParams.pageNum,
            pageSize: searchParams.pageSize,
            total: tableTotal,
            showTotal: (total) => `共 ${total} 条记录`,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: handlePageChange,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </Card>

      {/* 编辑文章模态框 */}
      <Modal
        title="编辑文章"
        open={editModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="确定"
        cancelText="取消"
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }
        }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="文章标题"
            rules={[
              { required: true, message: '请输入文章标题' },
              { min: 1, max: 100, message: '文章标题长度应在1-100个字符之间' }
            ]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item
            name="companyId"
            label="保司ID"
            rules={[
              { required: true, message: '请输入保司ID' },
              { type: 'number', min: 1, message: '保司ID必须大于0', transform: (value) => Number(value) }
            ]}
          >
            <InputNumber placeholder="请输入保司ID" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="分类ID"
            rules={[
              { required: true, message: '请输入分类ID' },
              { type: 'number', min: 1, message: '分类ID必须大于0', transform: (value) => Number(value) }
            ]}
          >
            <InputNumber placeholder="请输入分类ID" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标上传"
            rules={[
              { required: true, message: '请上传图标' }
            ]}
          >
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={async (file) => {
                try {
                  const result = await uploadImage(file)
                  editForm.setFieldsValue({ icon: result.url })
                  message.success('图标上传成功')
                } catch (error) {
                  message.error('图标上传失败')
                }
                return false
              }}
              onRemove={() => {
                editForm.setFieldsValue({ icon: '' })
              }}
            >
              <Button icon={<UploadOutlined />}>选择图标</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              支持上传图片格式
            </div>
          </Form.Item>

          <Form.Item
            name="pdfFile"
            label="PDF文件上传"
          >
            <Upload
              accept=".pdf"
              maxCount={1}
              beforeUpload={async (file) => {
                try {
                  const result = await uploadPdf(file)
                  editForm.setFieldsValue({ pdfFile: result.url })
                  message.success('PDF文件上传成功')
                } catch (error) {
                  message.error('PDF文件上传失败')
                }
                return false
              }}
              onRemove={() => {
                editForm.setFieldsValue({ pdfFile: '' })
              }}
            >
              <Button icon={<UploadOutlined />}>选择PDF文件</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              支持上传PDF文档
            </div>
          </Form.Item>

          <Form.Item
            name="wordFile"
            label="Word文档上传"
          >
            <Upload
              accept=".doc,.docx"
              maxCount={1}
              beforeUpload={async (file) => {
                try {
                  const result = await uploadDocument(file)
                  editForm.setFieldsValue({ wordFile: result.url })
                  message.success('Word文档上传成功')
                } catch (error) {
                  message.error('Word文档上传失败')
                }
                return false
              }}
              onRemove={() => {
                editForm.setFieldsValue({ wordFile: '' })
              }}
            >
              <Button icon={<UploadOutlined />}>选择Word文档</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              支持上传Word文档(.doc/.docx)
            </div>
          </Form.Item>

          <Form.Item
            name="mp3File"
            label="MP3音频上传"
          >
            <Upload
              accept=".mp3,audio/*"
              maxCount={1}
              beforeUpload={async (file) => {
                try {
                  const result = await uploadAudio(file)
                  editForm.setFieldsValue({ mp3File: result.url })
                  message.success('MP3音频上传成功')
                } catch (error) {
                  message.error('MP3音频上传失败')
                }
                return false
              }}
              onRemove={() => {
                editForm.setFieldsValue({ mp3File: '' })
              }}
            >
              <Button icon={<UploadOutlined />}>选择MP3音频</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              支持上传MP3音频文件
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增文章模态框 */}
      <Modal
        title="新增文章"
        open={addModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="确定"
        cancelText="取消"
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }
        }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="文章标题"
            rules={[
              { required: true, message: '请输入文章标题' },
              { min: 1, max: 100, message: '文章标题长度应在1-100个字符之间' }
            ]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item
            name="companyId"
            label="保司ID"
            rules={[
              { required: true, message: '请输入保司ID' },
              { type: 'number', min: 1, message: '保司ID必须大于0', transform: (value) => Number(value) }
            ]}
          >
            <InputNumber placeholder="请输入保司ID" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="分类ID"
            rules={[
              { required: true, message: '请输入分类ID' },
              { type: 'number', min: 1, message: '分类ID必须大于0', transform: (value) => Number(value) }
            ]}
          >
            <InputNumber placeholder="请输入分类ID" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标上传"
            rules={[
              { required: true, message: '请上传图标' }
            ]}
          >
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={async (file) => {
                try {
                  const result = await uploadImage(file)
                  editForm.setFieldsValue({ icon: result.url })
                  message.success('图标上传成功')
                } catch (error) {
                  message.error('图标上传失败')
                }
                return false
              }}
              onRemove={() => {
                editForm.setFieldsValue({ icon: '' })
              }}
            >
              <Button icon={<UploadOutlined />}>选择图标</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              支持上传图片格式
            </div>
          </Form.Item>

          <Form.Item
            name="pdfFile"
            label="PDF文件上传"
          >
            <Upload
              accept=".pdf"
              maxCount={1}
              beforeUpload={async (file) => {
                try {
                  const result = await uploadPdf(file)
                  editForm.setFieldsValue({ pdfFile: result.url })
                  message.success('PDF文件上传成功')
                } catch (error) {
                  message.error('PDF文件上传失败')
                }
                return false
              }}
              onRemove={() => {
                editForm.setFieldsValue({ pdfFile: '' })
              }}
            >
              <Button icon={<UploadOutlined />}>选择PDF文件</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              支持上传PDF文档
            </div>
          </Form.Item>

          <Form.Item
            name="wordFile"
            label="Word文档上传"
          >
            <Upload
              accept=".doc,.docx"
              maxCount={1}
              beforeUpload={async (file) => {
                try {
                  const result = await uploadDocument(file)
                  editForm.setFieldsValue({ wordFile: result.url })
                  message.success('Word文档上传成功')
                } catch (error) {
                  message.error('Word文档上传失败')
                }
                return false
              }}
              onRemove={() => {
                editForm.setFieldsValue({ wordFile: '' })
              }}
            >
              <Button icon={<UploadOutlined />}>选择Word文档</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              支持上传Word文档(.doc/.docx)
            </div>
          </Form.Item>

          <Form.Item
            name="mp3File"
            label="MP3音频上传"
          >
            <Upload
              accept=".mp3,audio/*"
              maxCount={1}
              beforeUpload={async (file) => {
                try {
                  const result = await uploadAudio(file)
                  editForm.setFieldsValue({ mp3File: result.url })
                  message.success('MP3音频上传成功')
                } catch (error) {
                  message.error('MP3音频上传失败')
                }
                return false
              }}
              onRemove={() => {
                editForm.setFieldsValue({ mp3File: '' })
              }}
            >
              <Button icon={<UploadOutlined />}>选择MP3音频</Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              支持上传MP3音频文件
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 富文本编辑器模态框 */}
      <Modal
        title={`编辑内容 - ${editingRecord?.name || ''}`}
        open={richTextModalVisible}
        onOk={() => handleRichTextSave(currentContent)}
        onCancel={() => setRichTextModalVisible(false)}
        width={1200}
        okText="保存"
        cancelText="取消"
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }
        }}
      >
        <RichTextEditor
          value={currentContent}
          onChange={setCurrentContent}
          height={500}
        />
      </Modal>

      {/* 内容预览模态框 */}
      <Modal
        title={`内容预览 - ${editingRecord?.name || ''}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>
        ]}
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }
        }}
      >
        <div style={{ maxHeight: '600px', overflow: 'auto', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '6px', backgroundColor: '#fff' }}>
          <div
            dangerouslySetInnerHTML={{ __html: renderContent(currentContent) }}
            style={{
              lineHeight: '1.6',
              fontSize: '14px',
              color: '#333'
            }}
          />
        </div>
      </Modal>
    </PageWrapper>
  )
}

export default ArticleManagement