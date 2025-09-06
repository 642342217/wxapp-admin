import { FC } from 'react'
import { Result, Button } from 'antd'
import { useNavigate, useLoaderData } from 'react-router-dom'
import { ExceptionEnum } from '@/enums/exceptionEnum'

interface ExceptionData {
  status: ExceptionEnum
  withCard?: boolean
}

const PageException: FC = () => {
  const navigate = useNavigate()
  const data = useLoaderData() as ExceptionData
  const { status, withCard = true } = data || {}

  const getExceptionConfig = (status: ExceptionEnum) => {
    switch (status) {
      case ExceptionEnum.PAGE_NOT_ACCESS:
        return {
          status: '403' as const,
          title: '403',
          subTitle: '抱歉，您无权访问此页面',
        }
      case ExceptionEnum.PAGE_NOT_FOUND:
        return {
          status: '404' as const,
          title: '404',
          subTitle: '抱歉，您访问的页面不存在',
        }
      default:
        return {
          status: '500' as const,
          title: '500',
          subTitle: '抱歉，服务器出现错误',
        }
    }
  }

  const config = getExceptionConfig(status)

  const handleBackHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: withCard ? 'auto' : '100vh',
      padding: withCard ? '20px' : '0'
    }}>
      <Result
        status={config.status}
        title={config.title}
        subTitle={config.subTitle}
        extra={[
          <Button type="primary" key="home" onClick={handleBackHome}>
            返回首页
          </Button>,
          <Button key="back" onClick={handleGoBack}>
            返回上页
          </Button>
        ]}
      />
    </div>
  )
}

export default PageException