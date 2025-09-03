import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAuthCache } from '@/utils/auth'
import { TOKEN_KEY } from '@/enums/cacheEnum'
import { useAppSelector, useAppDispatch } from '@/stores'
import { setUserInfo } from '@/stores/modules/user'
import { getUserInfo } from '@/api'

export const GuardRoute = ({ children }: { children: ReactNode }) => {
  const whiteList: string[] = ['/', '/home', '/login']
  const { pathname } = useLocation()
  const { token, userInfo } = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()
  const hasCalledRef = useRef(false)

  const getToken = (): string => {
    return token || getAuthCache<string>(TOKEN_KEY)
  }

  // 获取用户信息
  useEffect(() => {
    const currentToken = getToken()
    console.log('GuardRoute - token:', currentToken)
    console.log('GuardRoute - hasCalledRef.current:', hasCalledRef.current)

    if (currentToken && !hasCalledRef.current) {
      hasCalledRef.current = true
      console.log('GuardRoute - 开始获取用户信息')
      getUserInfo()
        .then(data => {
          console.log('GuardRoute - 获取用户信息成功:', data)
          dispatch(setUserInfo(data))
        })
        .catch(error => {
          console.error('获取用户信息失败:', error)
          hasCalledRef.current = false // 失败时重置，允许重试
        })
    }
  }, []) // 只在组件挂载时执行一次

  if (!getToken()) {
    if (whiteList.includes(pathname)) {
      return <Navigate to='/login' replace />
    } else {
      return <Navigate to={`/login?redirect=${pathname}`} replace />
    }
  }

  return children
}
