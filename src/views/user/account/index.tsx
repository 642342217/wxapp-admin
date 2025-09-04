import type { ColumnsType } from 'antd/es/table'
import { type FC, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Breadcrumb
} from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { PageWrapper } from '@/components/Page'
import { getAccountList, addAccount, updateAccount, deleteAccount } from '@/api'
import type { AccountDataType, AccountPageParams, AccountPageResult } from './types'

const AccountManagement: FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const actualUserId = userId ? Number(userId) : -1
  const navigate = useNavigate()
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<AccountDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [searchForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [searchParams, setSearchParams] = useState<AccountPageParams>({
    userId: actualUserId,
    account: '',
    pageSize: 10,
    pageNum: 1
  })

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<AccountDataType | null>(null)

  const columns: ColumnsType<AccountDataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: 80
    },
    {
      title: '账户名',
      dataIndex: 'account',
      align: 'center',
      width: 200
    },
    {
      title: '密码',
      dataIndex: 'password',
      align: 'center',
      width: 200
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
      width: 150,
      render: (_, record: AccountDataType) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            修改
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            删除
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
      const data = await getAccountList(searchParams)
      const { records, total } = data as AccountPageResult
      setTableData(records)
      setTableTotal(total)
    } catch (error) {
      message.error('获取账户列表失败')
    } finally {
      setTableLoading(false)
    }
  }

  function handleSearch() {
    const values = searchForm.getFieldsValue()
    setSearchParams({
      ...searchParams,
      account: values.account || '',
      pageNum: 1
    })
  }

  function handleReset() {
    searchForm.resetFields()
    setSearchParams({
      ...searchParams,
      account: '',
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

  function handleEdit(record: AccountDataType) {
    setCurrentRecord(record)
    setEditModalVisible(true)
    editForm.setFieldsValue({
      account: record.account,
      password: ''
    })
  }

  function handleDelete(record: AccountDataType) {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除账户"${record.account}"吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteAccount({ id: record.id })
          message.success('删除账户成功')
          fetchData()
        } catch (error) {
          message.error('删除账户失败')
        }
      }
    })
  }

  async function handleModalOk() {
    try {
      if (addModalVisible) {
        // 新增账户
        const values = await editForm.validateFields()
        await addAccount({
          userId: actualUserId,
          account: values.account,
          password: values.password
        })
        message.success('新增账户成功')
        setAddModalVisible(false)
        editForm.resetFields()
        fetchData()
      } else if (editModalVisible) {
        // 编辑账户
        const values = await editForm.validateFields()
        await updateAccount({
          id: currentRecord?.id!,
          account: values.account,
          password: values.password
        })
        message.success('编辑账户成功')
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

  function handleBack() {
    if (actualUserId === -1) {
      navigate('/dashboard') // 如果是从菜单进入的，返回首页
    } else {
      navigate('/user/list') // 如果是从用户管理进入的，返回用户列表
    }
  }

  return (
    <PageWrapper>
      {/* 面包屑导航 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Button type="link" onClick={handleBack} icon={<ArrowLeftOutlined />}>
                  {actualUserId === -1 ? '首页' : '用户管理'}
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Item>账户管理</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
          <Col>
            <span>
              {actualUserId === -1 ? '我的账户' : `用户ID: ${actualUserId}`}
            </span>
          </Col>
        </Row>
      </Card>

      {/* 搜索区域 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="account" label="账户名">
            <Input placeholder="请输入账户名" style={{ width: 200 }} />
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增账户
            </Button>
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

      {/* 编辑账户模态框 */}
      <Modal
        title="编辑账户"
        open={editModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={500}
        okText="确定"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="account"
            label="账户名"
            rules={[
              { required: true, message: '请输入账户名' },
              { min: 3, max: 20, message: '账户名长度应在3-20个字符之间' }
            ]}
          >
            <Input placeholder="请输入账户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度应在6-20个字符之间' }
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增账户模态框 */}
      <Modal
        title="新增账户"
        open={addModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={500}
        okText="确定"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="account"
            label="账户名"
            rules={[
              { required: true, message: '请输入账户名' },
              { min: 3, max: 20, message: '账户名长度应在3-20个字符之间' }
            ]}
          >
            <Input placeholder="请输入账户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度应在6-20个字符之间' }
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}

export default AccountManagement