import type { LoginParams, UserInfo } from '@/types'
import { type FC, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Input, Checkbox, Button, message, Image } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/stores'
import { setToken, setUserInfo, setSessionTimeout } from '@/stores/modules/user'
import { getAuthCache } from '@/utils/auth'
import { TOKEN_KEY } from '@/enums/cacheEnum'
import { loginApi, getUserInfo, getCaptcha } from '@/api'
import logoIcon from '@/assets/images/logo_name.png'
import classNames from 'classnames'
import styles from './index.module.less'

const LoginPage: FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')

  const dispatch = useAppDispatch()

  const { token, sessionTimeout } = useAppSelector(state => state.user)
  const getToken = (): string => {
    return token || getAuthCache<string>(TOKEN_KEY)
  }

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      const captchaData = await getCaptcha()
      setCaptchaImage(captchaData.imageUrl)
      setCaptchaKey(captchaData.captchaKey)
      setShowCaptcha(true)
    } catch (error) {
      message.error('获取验证码失败')
    }
  }

  const handleLogin = async (values: any) => {
    try {
      setLoading(true)
      const loginParams: any = {
        account: values.account,
        password: values.password
      }

      // 如果显示验证码，则添加验证码参数
      if (showCaptcha) {
        loginParams.code = values.code
        loginParams.codeKey = captchaKey
      }

      const userInfo = await loginAction(loginParams)
      if (userInfo) {
        message.success('登陆成功！')
      }
    } catch (error: any) {
      // 检查是否需要验证码
      if (error.needCaptcha) {
        await fetchCaptcha()
        message.warning('请输入验证码')
      } else {
        message.error((error as unknown as Error).message)
      }
    } finally {
      setLoading(false)
    }
  }

  const loginAction = async (
    params: LoginParams & {
      goHome?: boolean
    }
  ): Promise<UserInfo | null> => {
    try {
      const { goHome = true, ...loginParams } = params
      const data = await loginApi(loginParams)

      // 保存 Token
      dispatch(setToken(data?.token))
      return afterLoginAction(goHome)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const afterLoginAction = async (goHome?: boolean): Promise<UserInfo | null> => {
    if (!getToken()) return null

    const userInfo = await getUserInfoAction()

    if (sessionTimeout) {
      dispatch(setSessionTimeout(false))
    } else {
      const redirect = searchParams.get('redirect')
      if (redirect) {
        navigate(redirect)
      } else {
        goHome && navigate(userInfo?.homePath || '/home')
      }
    }

    return userInfo
  }

  const getUserInfoAction = async (): Promise<UserInfo | null> => {
    if (!getToken()) return null

    const userInfo = await getUserInfo()

    dispatch(setUserInfo(userInfo))

    return userInfo
  }

  return (
    <div className={styles['login-wrapper']}>
      <div className={styles['login-box']}>
        <div className={styles['login-box-title']}>
          <img src={logoIcon} alt='icon' />
          <p>账 号 登 录</p>
        </div>
        <Form
          form={form}
          initialValues={{
            account: 'admin',
            password: '654321',
            remember: true
          }}
          className={styles['login-box-form']}
          onFinish={handleLogin}
        >
          <Form.Item name='account' rules={[{ required: true, message: '请输入账号' }]}>
            <Input
              placeholder='请输入账号'
              prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} rev={undefined} />}
            />
          </Form.Item>
          <Form.Item name='password' rules={[{ required: true, message: '请输入密码' }]}>
            <Input
              type='password'
              placeholder='请输入密码'
              prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} rev={undefined} />}
            />
          </Form.Item>

          {showCaptcha && (
            <>
              <Form.Item name='code' rules={[{ required: true, message: '请输入验证码' }]}>
                <Input
                  placeholder='请输入验证码'
                  prefix={<SafetyOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} rev={undefined} />}
                  suffix={
                    <div style={{ cursor: 'pointer' }} onClick={fetchCaptcha}>
                      <Image
                        src={captchaImage}
                        alt="验证码"
                        width={80}
                        height={32}
                        preview={false}
                        style={{ borderRadius: '4px' }}
                      />
                    </div>
                  }
                />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type='primary' htmlType='submit' className={styles['login-btn']} loading={loading}>
              登 录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
