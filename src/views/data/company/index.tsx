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
  Image,
  InputNumber
} from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined, MinusOutlined } from '@ant-design/icons'
import { PageWrapper } from '@/components/Page'
import { getCompanyList, updateCompanyStatus, addCompany, updateCompany, updateCompanySort } from '@/api'
import type { CompanyDataType, CompanyPageParams, CompanyPageResult } from './types'

const CompanyManagement: FC = () => {
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<CompanyDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [searchForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [searchParams, setSearchParams] = useState<CompanyPageParams>({
    name: '',
    pageSize: 10,
    pageNum: 1
  })

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<CompanyDataType | null>(null)

  const columns: ColumnsType<CompanyDataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      width: 80
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
      title: '保司名称',
      dataIndex: 'name',
      align: 'center',
      width: 200
    },
    {
      title: '简称',
      dataIndex: 'shortName',
      align: 'center',
      width: 120
    },
    {
      title: '排序',
      dataIndex: 'sort',
      align: 'center',
      width: 150,
      render: (sort: number, record: CompanyDataType) => (
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
      render: (status: number, record: CompanyDataType) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(record, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
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
      render: (_, record: CompanyDataType) => (
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
      const data = await getCompanyList(searchParams)
      const { records, total } = data as CompanyPageResult
      setTableData(records)
      setTableTotal(total)
    } catch (error) {
      message.error('获取保司列表失败')
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

  function handleEdit(record: CompanyDataType) {
    setCurrentRecord(record)
    setEditModalVisible(true)
    editForm.setFieldsValue(record)
  }

  function handleStatusChange(record: CompanyDataType, checked: boolean) {
    const newStatus = checked ? 1 : 0
    const action = newStatus === 1 ? '启用' : '禁用'

    Modal.confirm({
      title: `确认${action}`,
      content: `确定要${action}保司"${record.name}"吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await updateCompanyStatus({ id: record.id, status: newStatus })
          message.success(`${action}成功`)
          fetchData()
        } catch (error) {
          message.error(`${action}失败`)
        }
      }
    })
  }

  async function handleSortChange(record: CompanyDataType, newSort: number) {
    try {
      await updateCompanySort({
        id: record.id,
        icon: record.icon,
        name: record.name,
        shortName: record.shortName,
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
        // 新增保司
        const values = await editForm.validateFields()
        await addCompany({
          name: values.name,
          shortName: values.shortName,
          icon: values.icon,
          sort: Number(values.sort)
        })
        message.success('新增保司成功')
        setAddModalVisible(false)
        editForm.resetFields()
        fetchData()
      } else if (editModalVisible) {
        // 编辑保司
        const values = await editForm.validateFields()
        await updateCompany({
          id: currentRecord?.id,
          name: values.name,
          shortName: values.shortName,
          icon: values.icon,
          sort: Number(values.sort)
        })
        message.success('编辑保司成功')
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
          <Form.Item name="name" label="保司名称">
            <Input placeholder="请输入保司名称" style={{ width: 200 }} />
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
              新增保司
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

      {/* 编辑保司模态框 */}
      <Modal
        title="编辑保司"
        open={editModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="保司名称"
            rules={[
              { required: true, message: '请输入保司名称' },
              { min: 2, max: 50, message: '保司名称长度应在2-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入保司名称" />
          </Form.Item>
          <Form.Item
            name="shortName"
            label="简称"
            rules={[
              { required: true, message: '请输入简称' },
              { min: 1, max: 20, message: '简称长度应在1-20个字符之间' }
            ]}
          >
            <Input placeholder="请输入简称" />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标链接"
            rules={[
              { required: true, message: '请输入图标链接' },
              { type: 'url', message: '请输入正确的URL格式' }
            ]}
          >
            <Input placeholder="请输入图标链接" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增保司模态框 */}
      <Modal
        title="新增保司"
        open={addModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="保司名称"
            rules={[
              { required: true, message: '请输入保司名称' },
              { min: 2, max: 50, message: '保司名称长度应在2-50个字符之间' }
            ]}
          >
            <Input placeholder="请输入保司名称" />
          </Form.Item>
          <Form.Item
            name="shortName"
            label="简称"
            rules={[
              { required: true, message: '请输入简称' },
              { min: 1, max: 20, message: '简称长度应在1-20个字符之间' }
            ]}
          >
            <Input placeholder="请输入简称" />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标链接"
            rules={[
              { required: true, message: '请输入图标链接' },
              { type: 'url', message: '请输入正确的URL格式' }
            ]}
          >
            <Input placeholder="请输入图标链接" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
            rules={[
              { required: true, message: '请输入排序值' },
              { type: 'number', min: 0, max: 9999, message: '排序值应在0-9999之间', transform: (value) => Number(value) }
            ]}
          >
            <InputNumber placeholder="请输入排序值" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  )
}

export default CompanyManagement