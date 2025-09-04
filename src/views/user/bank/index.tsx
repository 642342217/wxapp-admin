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
  Breadcrumb,
  Switch
} from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { PageWrapper } from '@/components/Page'
import { getBankAccountList, addBankAccount, updateBankAccount, deleteBankAccount } from '@/api'
import type { BankAccountDataType, BankAccountPageParams, BankAccountPageResult } from './types'

const BankAccountManagement: FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const actualUserId = userId ? Number(userId) : -1
  const navigate = useNavigate()
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<BankAccountDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [searchForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [searchParams, setSearchParams] = useState<BankAccountPageParams>({
    userId: actualUserId,
    account: '',
    pageSize: 10,
    pageNum: 1
  })

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<BankAccountDataType | null>(null)

  const columns: ColumnsType<BankAccountDataType> = [
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
      title: '银行',
      dataIndex: 'bank',
      align: 'center',
      width: 200
    },
    {
      title: '快捷号',
      dataIndex: 'fastNum',
      align: 'center',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (status: number, record: BankAccountDataType) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(record, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      align: 'center',
      width: 150,
      render: (remarks: string) => remarks || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString()
    }
  ]

  useEffect(() => {
    fetchData()
  }, [searchParams])

  async function fetchData() {
    setTableLoading(true)
    try {
      const data = await getBankAccountList(searchParams)
      const { records, total } = data as BankAccountPageResult
      setTableData(records)
      setTableTotal(total)
    } catch (error) {
      message.error('获取银行账户列表失败')
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

  function handleEdit(record: BankAccountDataType) {
    setCurrentRecord(record)
    setEditModalVisible(true)
    editForm.setFieldsValue({
      account: record.account,
      bank: record.bank,
      fastNum: record.fastNum,
      remarks: record.remarks
    })
  }

  function handleDelete(record: BankAccountDataType) {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除银行账户"${record.account}"吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteBankAccount({ id: record.id })
          message.success('删除银行账户成功')
          fetchData()
        } catch (error) {
          message.error('删除银行账户失败')
        }
      }
    })
  }

  function handleStatusChange(record: BankAccountDataType, checked: boolean) {
    const newStatus = checked ? 1 : 0
    const action = newStatus === 1 ? '启用' : '禁用'

    Modal.confirm({
      title: `确认${action}`,
      content: `确定要${action}银行账户"${record.account}"吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await updateBankAccount({
            id: record.id,
            account: record.account,
            bank: record.bank,
            fastNum: record.fastNum,
            status: newStatus,
            remarks: record.remarks
          })
          message.success(`${action}成功`)
          fetchData()
        } catch (error) {
          message.error(`${action}失败`)
        }
      }
    })
  }

  async function handleModalOk() {
    try {
      if (addModalVisible) {
        // 新增银行账户
        const values = await editForm.validateFields()
        await addBankAccount({
          userId: actualUserId,
          account: values.account,
          bank: values.bank,
          fastNum: values.fastNum,
          remarks: values.remarks
        })
        message.success('新增银行账户成功')
        setAddModalVisible(false)
        editForm.resetFields()
        fetchData()
      } else if (editModalVisible) {
        // 编辑银行账户
        const values = await editForm.validateFields()
        await updateBankAccount({
          id: currentRecord?.id!,
          account: values.account,
          bank: values.bank,
          fastNum: values.fastNum,
          remarks: values.remarks
        })
        message.success('编辑银行账户成功')
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
      navigate('/dashboard')
    } else {
      navigate('/user/list')
    }
  }

  return (
    <PageWrapper>

      {/* 搜索区域 - 仅在我的银行账户（actualUserId === -1）时显示 */}
      {actualUserId === -1 && (
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
      )}

      {/* 内容区域 */}
      <Card bordered={false}>

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

      {/* 编辑银行账户模态框 */}
      <Modal
        title="编辑银行账户"
        open={editModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="account"
            label="账户名"
            rules={[
              { required: true, message: '请输入账户名' },
              { min: 3, max: 50, message: '账户名长度应在3-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入账户名" />
          </Form.Item>
          <Form.Item
            name="bank"
            label="银行"
            rules={[
              { required: true, message: '请输入银行名称' },
              { min: 2, max: 50, message: '银行名称长度应在2-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入银行名称" />
          </Form.Item>
          <Form.Item
            name="fastNum"
            label="快捷号"
            rules={[
              { required: true, message: '请输入快捷号' },
              { min: 1, max: 20, message: '快捷号长度应在1-20个字符之间' }
            ]}
          >
            <Input placeholder="请输入快捷号" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增银行账户模态框 */}
      <Modal
        title="新增银行账户"
        open={addModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="account"
            label="账户名"
            rules={[
              { required: true, message: '请输入账户名' },
              { min: 3, max: 50, message: '账户名长度应在3-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入账户名" />
          </Form.Item>
          <Form.Item
            name="bank"
            label="银行"
            rules={[
              { required: true, message: '请输入银行名称' },
              { min: 2, max: 50, message: '银行名称长度应在2-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入银行名称" />
          </Form.Item>
          <Form.Item
            name="fastNum"
            label="快捷号"
            rules={[
              { required: true, message: '请输入快捷号' },
              { min: 1, max: 20, message: '快捷号长度应在1-20个字符之间' }
            ]}
          >
            <Input placeholder="请输入快捷号" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}

export default BankAccountManagement