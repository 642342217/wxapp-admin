import { lazy } from '@loadable/component'
import type { RouteObject } from '../types'
import { LayoutGuard } from '../guard'
import { LazyLoad } from '@/components/LazyLoad'

// customer module page
const CustomerRoute: RouteObject = {
  path: '/customer',
  name: 'Customer',
  element: <LayoutGuard />,
  meta: {
    title: '客户管理',
    icon: 'person',
    orderNo: 6
  },
  children: [
    {
      path: 'management',
      name: 'CustomerManagement',
      element: LazyLoad(lazy(() => import('@/views/customer'))),
      meta: {
        title: '客户管理',
        key: 'customerManagement'
      }
    }
  ]
}

export default CustomerRoute