import type { ColumnsType } from 'antd/es/table'
import { type FC, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  message,
  InputNumber,
  Breadcrumb
} from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { PageWrapper } from '@/components/Page'
import { getAccountList, addAccount, updateAccount, deleteAccount } from '@/api'
import type { AccountDataType, AccountPageParams, AccountPageResult } from './types'

const AccountManagement: FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<AccountDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [searchForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [searchParams, setSearchParams] = useState<AccountPageParams>({
    userId: Number(userId),
    accountName: '',
    pageSize: 10,
    pageNum: 1
  })

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<AccountDataType | null>(null)

  const accountTypes = [
    { label: '储蓄账户', value: 'savings' },
    { label: '支票账户', value: 'checking' },
    { label: '信用账户', value: 'credit' },
    { label: '投资账户', value: 'investment' }
  ]

  const columns: ColumnsType<AccountDataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: 80
    },
    {
      title: '账户名称',
      dataIndex: 'accountName',
      align: 'center',
      width: 150
    },
    {
      title: '账户类型',
      dataIndex: 'accountType',
      align: 'center',
      width: 120,
      render: (type: string) => {
        const typeObj = accountTypes.find(item => item.value === type)
        return typeObj ? typeObj.label : type
      }
    },
    {
      title: '余额',
      dataIndex: 'balance',
      align: 'center',
      width: 120,
      render: (balance: number) => `¥${balance.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '冻结'}
        </Tag>
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
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      width: 150,
      render: (remark: string) => remark || '-'
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
      accountName: values.accountName || '',
      pageNum: 1
    })
  }

  function handleReset() {
    searchForm.resetFields()
    setSearchParams({
      ...searchParams,
      accountName: '',
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
    editForm.setFieldsValue(record)
  }

  function handleDelete(record: AccountDataType) {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除账户"${record.accountName}"吗？`,
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
          userId: Number(userId),
          accountName: values.accountName,
          accountType: values.accountType,
          balance: values.balance,
          remark: values.remark
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
          accountName: values.accountName,
          accountType: values.accountType,
          balance: values.balance,
          remark: values.remark
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
    navigate('/user/list')
  }

  return (
    <PageWrapper>

      {/* 搜索区域 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="accountName" label="账户名称">
            <Input placeholder="请输入账户名称" style={{ width: 200 }} />
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
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="accountName"
            label="账户名称"
            rules={[
              { required: true, message: '请输入账户名称' },
              { min: 2, max: 50, message: '账户名称长度应在2-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入账户名称" />
          </Form.Item>
          <Form.Item
            name="accountType"
            label="账户类型"
            rules={[{ required: true, message: '请选择账户类型' }]}
          >
            <Select placeholder="请选择账户类型" options={accountTypes} />
          </Form.Item>
          <Form.Item
            name="balance"
            label="余额"
            rules={[
              { required: true, message: '请输入余额' },
              { type: 'number', min: 0, message: '余额不能为负数' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入余额"
              precision={2}
              min={0}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增账户模态框 */}
      <Modal
        title="新增账户"
        open={addModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="accountName"
            label="账户名称"
            rules={[
              { required: true, message: '请输入账户名称' },
              { min: 2, max: 50, message: '账户名称长度应在2-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入账户名称" />
          </Form.Item>
          <Form.Item
            name="accountType"
            label="账户类型"
            rules={[{ required: true, message: '请选择账户类型' }]}
          >
            <Select placeholder="请选择账户类型" options={accountTypes} />
          </Form.Item>
          <Form.Item
            name="balance"
            label="初始余额"
            rules={[
              { required: true, message: '请输入初始余额' },
              { type: 'number', min: 0, message: '余额不能为负数' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入初始余额"
              precision={2}
              min={0}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}

export default AccountManagement