import { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { changePasswordApi } from '@/api'
import { useAppDispatch } from '@/stores'
import { resetState } from '@/stores/modules/user'
import { clearAuthCache } from '@/utils/auth'

interface ChangePasswordModalProps {
  open: boolean
  onCancel: () => void
}

interface ChangePasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChangePasswordModal({ open, onCancel }: ChangePasswordModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      await changePasswordApi({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      })

      message.success('密码修改成功，请重新登录')

      // 清除登录状态并跳转到登录页
      dispatch(resetState())
      clearAuthCache()
      navigate('/login')

      onCancel()
    } catch (error: any) {
      message.error(error?.message || '密码修改失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="修改密码"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnClose
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label="原密码"
          name="oldPassword"
          rules={[
            { required: true, message: '请输入原密码' }
          ]}
        >
          <Input.Password placeholder="请输入原密码" />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码长度至少6位' }
          ]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              }
            })
          ]}
        >
          <Input.Password placeholder="请确认新密码" />
        </Form.Item>
      </Form>
    </Modal>
  )
}