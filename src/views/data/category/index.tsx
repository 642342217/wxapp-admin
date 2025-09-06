import type { ColumnsType } from 'antd/es/table'
import { type FC, useState, useEffect } from 'react'
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
  InputNumber
} from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { PageWrapper } from '@/components/Page'
import { getCategoryList, updateCategoryStatus, addCategory, updateCategory, updateCategorySort } from '@/api'
import type { CategoryDataType, CategoryPageParams, CategoryPageResult } from './types'

const CategoryManagement: FC = () => {
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<CategoryDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [editForm] = Form.useForm()

  const [searchParams, setSearchParams] = useState<CategoryPageParams>({
    pageSize: 10,
    pageNum: 1
  })

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<CategoryDataType | null>(null)

  const columns: ColumnsType<CategoryDataType> = [
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
      title: '分类名称',
      dataIndex: 'name',
      align: 'center',
      width: 200
    },
    {
      title: '排序',
      dataIndex: 'sort',
      align: 'center',
      width: 150,
      render: (sort: number, record: CategoryDataType) => (
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
      render: (status: number, record: CategoryDataType) => (
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
      render: (_, record: CategoryDataType) => (
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
      const data = await getCategoryList(searchParams)
      const { records, total } = data as CategoryPageResult
      setTableData(records)
      setTableTotal(total)
    } catch (error) {
      message.error('获取分类列表失败')
    } finally {
      setTableLoading(false)
    }
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

  function handleEdit(record: CategoryDataType) {
    setCurrentRecord(record)
    setEditModalVisible(true)
    editForm.setFieldsValue(record)
  }

  function handleStatusChange(record: CategoryDataType, checked: boolean) {
    const newStatus = checked ? 1 : 0
    const action = newStatus === 1 ? '启用' : '禁用'

    Modal.confirm({
      title: `确认${action}`,
      content: `确定要${action}分类"${record.name}"吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await updateCategoryStatus({ id: record.id, status: newStatus })
          message.success(`${action}成功`)
          fetchData()
        } catch (error) {
          message.error(`${action}失败`)
        }
      }
    })
  }

  async function handleSortChange(record: CategoryDataType, newSort: number) {
    try {
      await updateCategorySort({
        id: record.id,
        sort: newSort
      })
      message.success('排序更新成功')
      fetchData()
    } catch (error) {
      message.error('排序更新失败')
    }
  }

  async function handleModalOk() {
    try {
      if (addModalVisible) {
        // 新增分类
        const values = await editForm.validateFields()
        await addCategory({
          name: values.name,
          companyId: Number(values.companyId)
        })
        message.success('新增分类成功')
        setAddModalVisible(false)
        editForm.resetFields()
        fetchData()
      } else if (editModalVisible) {
        // 编辑分类
        const values = await editForm.validateFields()
        await updateCategory({
          id: currentRecord?.id,
          name: values.name,
          companyId: Number(values.companyId)
        })
        message.success('编辑分类成功')
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
      {/* 内容区域 */}
      <Card bordered={false}>
        {/* 操作按钮区域 */}
        <Row style={{ marginBottom: 16 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增分类
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

      {/* 编辑分类模态框 */}
      <Modal
        title="编辑分类"
        open={editModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
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
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { min: 1, max: 50, message: '分类名称长度应在1-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入分类名称" />
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
        </Form>
      </Modal>

      {/* 新增分类模态框 */}
      <Modal
        title="新增分类"
        open={addModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
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
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { min: 1, max: 50, message: '分类名称长度应在1-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入分类名称" />
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
        </Form>
      </Modal>
    </PageWrapper>
  )
}

export default CategoryManagement