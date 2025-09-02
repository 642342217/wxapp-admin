import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import axios from 'axios'
import { message } from 'antd'
import { getToken, clearAuthCache } from '@/utils/auth'

// Create axios instance
const service = axios.create({
  baseURL: '/api',
  timeout: 10 * 1000
})

// Handle Error
const handleError = (error: AxiosError): Promise<AxiosError> => {
  if (error.response?.status === 401 || error.response?.status === 504) {
    clearAuthCache()
    location.href = '/login'
  }

  // 处理402状态码，需要验证码
  if (error.response?.status === 402) {
    return Promise.reject({ ...error, needCaptcha: true })
  }

  message.error(error.message || 'error')
  return Promise.reject(error)
}

// Request interceptors configuration
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    ; (config as Recordable).headers['Authorization'] = `${token}`
  }
  ; (config as Recordable).headers['Content-Type'] = 'application/json'
  return config
}, handleError)

// Respose interceptors configuration
service.interceptors.response.use((response: AxiosResponse) => {
  // 如果是blob类型，直接返回response
  if (response.config.responseType === 'blob') {
    return response
  }

  const data = response.data

  if (data.code === 0) {
    return data.data
  } else {
    message.error(data.message)
    return Promise.reject('error')
  }
}, handleError)

export { service }
