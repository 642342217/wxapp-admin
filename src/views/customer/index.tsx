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
  Select,
  DatePicker,
  InputNumber
} from 'antd'
import { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { PageWrapper } from '@/components/Page'
import { getCustomerList, addCustomer, updateCustomer, updateCustomerStatus } from '@/api'
import type { CustomerDataType, CustomerPageParams, CustomerPageResult } from './types'
import dayjs from 'dayjs'

const { Option } = Select

const CustomerManagement: FC = () => {
  const [tableLoading, setTableLoading] = useState(false)
  const [tableData, setTableData] = useState<CustomerDataType[]>([])
  const [tableTotal, setTableTotal] = useState<number>(0)
  const [searchForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [searchParams, setSearchParams] = useState<CustomerPageParams>({
    name: '',
    pageSize: 10,
    pageNum: 1
  })

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<CustomerDataType | null>(null)

  const columns: ColumnsType<CustomerDataType> = [
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
      title: '英文名',
      dataIndex: 'nameEn',
      align: 'center',
      width: 120
    },
    {
      title: '证件号码',
      dataIndex: 'number',
      align: 'center',
      width: 180
    },
    {
      title: '地址',
      dataIndex: 'address',
      align: 'center',
      width: 150
    },
    {
      title: '电话',
      dataIndex: 'phone',
      align: 'center',
      width: 120
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      align: 'center',
      width: 180
    },
    {
      title: '性别',
      dataIndex: 'gender',
      align: 'center',
      width: 80,
      render: (gender: number) => gender === 1 ? '男' : '女'
    },
    {
      title: '婚姻状况',
      dataIndex: 'maritalStatus',
      align: 'center',
      width: 100,
      render: (status: number) => status === 1 ? '已婚' : '未婚'
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (status: number, record: CustomerDataType) => (
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
      fixed: 'right',
      render: (_, record: CustomerDataType) => (
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
      const data = await getCustomerList(searchParams)
      const { records, total } = data as CustomerPageResult
      setTableData(records)
      setTableTotal(total)
    } catch (error) {
      message.error('获取客户列表失败')
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

  function handleEdit(record: CustomerDataType) {
    setCurrentRecord(record)
    setEditModalVisible(true)
    editForm.setFieldsValue({
      ...record,
      birthday: record.birthday ? dayjs(record.birthday) : null
    })
  }

  function handleStatusChange(record: CustomerDataType, checked: boolean) {
    const newStatus = checked ? 1 : 0
    const action = newStatus === 1 ? '启用' : '禁用'

    Modal.confirm({
      title: `确认${action}`,
      content: `确定要${action}客户"${record.name}"吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await updateCustomerStatus({ id: record.id, status: newStatus })
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
        // 新增客户
        const values = await editForm.validateFields()
        const submitData = {
          ...values,
          birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') + 'T00:00:00' : null
        }
        await addCustomer(submitData)
        message.success('新增客户成功')
        setAddModalVisible(false)
        editForm.resetFields()
        fetchData()
      } else if (editModalVisible) {
        // 编辑客户
        const values = await editForm.validateFields()
        const submitData = {
          ...values,
          id: currentRecord?.id,
          birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') + 'T00:00:00' : null
        }
        await updateCustomer(submitData)
        message.success('编辑客户成功')
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

  const formItems = (
    <>
      <Form.Item
        name="name"
        label="姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item
        name="nameEn"
        label="英文名"
        rules={[{ required: true, message: '请输入英文名' }]}
      >
        <Input placeholder="请输入英文名" />
      </Form.Item>
      <Form.Item
        name="number"
        label="证件号码"
        rules={[{ required: true, message: '请输入证件号码' }]}
      >
        <Input placeholder="请输入证件号码" />
      </Form.Item>
      <Form.Item
        name="address"
        label="地址"
        rules={[{ required: true, message: '请输入地址' }]}
      >
        <Input placeholder="请输入地址" />
      </Form.Item>
      <Form.Item
        name="hkType"
        label="证件类型"
        rules={[{ required: true, message: '请选择证件类型' }]}
      >
        <Select placeholder="请选择证件类型">
          <Option value={1}>身份证</Option>
          <Option value={2}>护照</Option>
          <Option value={3}>港澳通行证</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="hkNum"
        label="证件编号"
        rules={[{ required: true, message: '请输入证件编号' }]}
      >
        <Input placeholder="请输入证件编号" />
      </Form.Item>
      <Form.Item
        name="callAddress"
        label="通讯地址"
        rules={[{ required: true, message: '请输入通讯地址' }]}
      >
        <Input placeholder="请输入通讯地址" />
      </Form.Item>
      <Form.Item
        name="phone"
        label="电话"
        rules={[{ required: true, message: '请输入电话' }]}
      >
        <Input placeholder="请输入电话" />
      </Form.Item>
      <Form.Item
        name="country"
        label="国家"
        rules={[{ required: true, message: '请输入国家' }]}
      >
        <Input placeholder="请输入国家" />
      </Form.Item>
      <Form.Item
        name="birthday"
        label="生日"
      >
        <DatePicker placeholder="请选择生日" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="zip"
        label="邮编"
      >
        <Input placeholder="请输入邮编" />
      </Form.Item>
      <Form.Item
        name="gender"
        label="性别"
        rules={[{ required: true, message: '请选择性别' }]}
      >
        <Select placeholder="请选择性别">
          <Option value={1}>男</Option>
          <Option value={0}>女</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="smoke"
        label="是否吸烟"
        rules={[{ required: true, message: '请选择是否吸烟' }]}
      >
        <Select placeholder="请选择是否吸烟">
          <Option value={1}>是</Option>
          <Option value={0}>否</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱格式' }
        ]}
      >
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item
        name="high"
        label="身高(cm)"
      >
        <Input placeholder="请输入身高" />
      </Form.Item>
      <Form.Item
        name="weigh"
        label="体重(kg)"
      >
        <Input placeholder="请输入体重" />
      </Form.Item>
      <Form.Item
        name="degree"
        label="学历"
        rules={[{ required: true, message: '请选择学历' }]}
      >
        <Select placeholder="请选择学历">
          <Option value={0}>小学</Option>
          <Option value={1}>初中</Option>
          <Option value={2}>高中</Option>
          <Option value={3}>大专</Option>
          <Option value={4}>本科</Option>
          <Option value={5}>硕士</Option>
          <Option value={6}>博士</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="maritalStatus"
        label="婚姻状况"
        rules={[{ required: true, message: '请选择婚姻状况' }]}
      >
        <Select placeholder="请选择婚姻状况">
          <Option value={0}>未婚</Option>
          <Option value={1}>已婚</Option>
        </Select>
      </Form.Item>
      {!addModalVisible && (
        <Form.Item
          name="userId"
          label="用户ID"
          rules={[{ required: true, message: '请输入用户ID' }]}
        >
          <InputNumber placeholder="请输入用户ID" style={{ width: '100%' }} />
        </Form.Item>
      )}
      {addModalVisible && (
        <Form.Item
          name="userId"
          label="用户ID"
          rules={[{ required: true, message: '请输入用户ID' }]}
          initialValue={1}
        >
          <InputNumber placeholder="请输入用户ID" style={{ width: '100%' }} />
        </Form.Item>
      )}
    </>
  )

  return (
    <PageWrapper>
      {/* 搜索区域 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="name" label="客户姓名">
            <Input placeholder="请输入客户姓名" style={{ width: 200 }} />
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
                新增客户
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tableData}
          loading={tableLoading}
          scroll={{ x: 1500 }}
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

      {/* 编辑客户模态框 */}
      <Modal
        title="编辑客户"
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
          {formItems}
        </Form>
      </Modal>

      {/* 新增客户模态框 */}
      <Modal
        title="新增客户"
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
          {formItems}
        </Form>
      </Modal>
    </PageWrapper>
  )
}

export default CustomerManagement