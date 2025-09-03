import { lazy } from '@loadable/component'
import type { RouteObject } from '../types'
import { LayoutGuard } from '../guard'
import { LazyLoad } from '@/components/LazyLoad'

// user module page
const UserRoute: RouteObject = {
  path: '/user',
  name: 'User',
  element: <LayoutGuard />,
  meta: {
    title: '用户管理',
    icon: 'person',
    orderNo: 4
  },
  children: [
    {
      path: 'list',
      name: 'UserList',
      element: LazyLoad(lazy(() => import('@/views/user'))),
      meta: {
        title: '用户管理',
        key: 'userList'
      }
    }
  ]
}

export default UserRoute