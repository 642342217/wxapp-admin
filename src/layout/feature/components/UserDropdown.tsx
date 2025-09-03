import type { MenuProps } from 'antd'
import { useState } from 'react'
import { Space, Dropdown } from 'antd'
import { PoweroffOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getAuthCache, clearAuthCache } from '@/utils/auth'
import { TOKEN_KEY } from '@/enums/cacheEnum'
import { useAppDispatch, useAppSelector } from '@/stores'
import { useMessage } from '@/hooks/web/useMessage'
import { logoutApi } from '@/api'
import { resetState } from '@/stores/modules/user'
import ChangePasswordModal from './ChangePasswordModal'

export default function UserDropdown() {
  const [changePasswordVisible, setChangePasswordVisible] = useState(false)

  const items: MenuProps['items'] = [
    {
      key: 'changePassword',
      label: (
        <Space size={4}>
          <KeyOutlined rev={undefined} />
          <span>修改密码</span>
        </Space>
      )
    },
    {
      key: 'logout',
      label: (
        <Space size={4}>
          <PoweroffOutlined rev={undefined} />
          <span>退出登录</span>
        </Space>
      )
    }
  ]

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'changePassword') {
      setChangePasswordVisible(true)
    } else if (key === 'logout') {
      handleLogout()
    }
  }

  const navigate = useNavigate()

  const dispatch = useAppDispatch()
  const { token, userInfo } = useAppSelector(state => state.user)

  const getToken = (): string => {
    return token || getAuthCache<string>(TOKEN_KEY)
  }

  const handleLogout = () => {
    const { createConfirm } = useMessage()

    createConfirm({
      iconType: 'warning',
      title: <span>温馨提醒</span>,
      content: <span>是否确认退出系统?</span>,
      onOk: async () => {
        await logoutAction(true)
      }
    })
  }

  const logoutAction = async (goLogin = false) => {
    if (getToken()) {
      try {
        await logoutApi()
      } catch (error) {
        const { createMessage } = useMessage()
        createMessage.error('注销失败!')
      }
    }
    dispatch(resetState())
    clearAuthCache()
    goLogin && navigate('/login')
  }

  return (
    <>
      <Dropdown menu={{ items, onClick }} placement='bottomRight' arrow>
        <span className='flex-center' style={{ cursor: 'pointer', padding: '0 8px' }}>
          <UserOutlined style={{ marginRight: '4px' }} rev={undefined} />
          <span>{userInfo?.username || '用户'}</span>
        </span>
      </Dropdown>

      <ChangePasswordModal
        open={changePasswordVisible}
        onCancel={() => setChangePasswordVisible(false)}
      />
    </>
  )
}
