import type { ColumnsType } from 'antd/es/table'
import { type FC, useState, useEffect } from 'react'
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
  message
} from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { PageWrapper } from '@/components/Page'
import { getUserList, updateUserStatus } from '@/api'
import type { UserDataType, UserPageParams, UserPageResult } from './types'

const UserManagement: FC = () => {
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<UserDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [searchForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [searchParams, setSearchParams] = useState<UserPageParams>({
    name: '',
    pageSize: 10,
    pageNum: 1
  })

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [remarkModalVisible, setRemarkModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<UserDataType | null>(null)

  const columns: ColumnsType<UserDataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: 80
    },
    {
      title: '姓名',
      dataIndex: 'name',
      align: 'center',
      width: 120
    },
    {
      title: '性别',
      dataIndex: 'gender',
      align: 'center',
      width: 80,
      render: (gender: number) => gender === 1 ? '男' : '女'
    },
    {
      title: '年龄',
      dataIndex: 'age',
      align: 'center',
      width: 80
    },
    {
      title: '电话',
      dataIndex: 'telephone',
      align: 'center',
      width: 140
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '封号'}
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
      title: '操作',
      key: 'action',
      align: 'center',
      width: 200,
      render: (_, record: UserDataType) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            修改
          </Button>
          <Button size="small" onClick={() => handleRemark(record)}>
            备注
          </Button>
          <Button
            size="small"
            type={record.status === 1 ? 'primary' : 'default'}
            danger={record.status === 1}
            onClick={() => handleStatusChange(record)}
          >
            {record.status === 1 ? '封号' : '解封'}
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
      const data = await getUserList(searchParams)
      const { records, total } = data as UserPageResult
      setTableData(records)
      setTableTotal(total)
    } catch (error) {
      message.error('获取用户列表失败')
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

  function handleEdit(record: UserDataType) {
    setCurrentRecord(record)
    setEditModalVisible(true)
    editForm.setFieldsValue(record)
  }

  function handleRemark(record: UserDataType) {
    setCurrentRecord(record)
    setRemarkModalVisible(true)
    editForm.setFieldsValue({ remark: record.remark || '' })
  }

  function handleStatusChange(record: UserDataType) {
    const newStatus = record.status === 1 ? 0 : 1
    const action = newStatus === 1 ? '解封' : '封号'

    Modal.confirm({
      title: `确认${action}`,
      content: `确定要${action}用户"${record.name}"吗？`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await updateUserStatus({ id: record.id, status: newStatus })
          message.success(`${action}成功`)
          fetchData()
        } catch (error) {
          message.error(`${action}失败`)
        }
      }
    })
  }

  function handleModalOk() {
    // 这里可以添加保存逻辑
    message.success('操作成功')
    setEditModalVisible(false)
    setRemarkModalVisible(false)
    setAddModalVisible(false)
    fetchData()
  }

  function handleModalCancel() {
    setEditModalVisible(false)
    setRemarkModalVisible(false)
    setAddModalVisible(false)
    setCurrentRecord(null)
  }

  return (
    <PageWrapper>
      <Card bordered={false}>
        {/* 搜索区域 */}
        <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="name" label="用户姓名">
            <Input placeholder="请输入用户姓名" style={{ width: 200 }} />
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

        {/* 操作按钮区域 */}
        <Row style={{ marginBottom: 16 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增用户
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

        {/* 编辑用户模态框 */}
        <Modal
          title="编辑用户"
          open={editModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
              <Select>
                <Select.Option value={1}>男</Select.Option>
                <Select.Option value={0}>女</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="age" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="telephone" label="电话" rules={[{ required: true, message: '请输入电话' }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>

        {/* 备注模态框 */}
        <Modal
          title="用户备注"
          open={remarkModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={500}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={4} placeholder="请输入备注信息" />
            </Form.Item>
          </Form>
        </Modal>

        {/* 新增用户模态框 */}
        <Modal
          title="新增用户"
          open={addModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
              <Select placeholder="请选择性别">
                <Select.Option value={1}>男</Select.Option>
                <Select.Option value={0}>女</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="age" label="年龄" rules={[{ required: true, message: '请输入年龄' }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="telephone" label="电话" rules={[{ required: true, message: '请输入电话' }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </PageWrapper>
  )
}

export default UserManagement