import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import router from '@/router'
import { setupProdMockServer } from '../mock/_createProductionServer'

function App() {
  const isBuild = process.env.NODE_ENV === 'production'
  if (isBuild) {
    setupProdMockServer()
  }

  return (
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App
