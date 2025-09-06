import { lazy } from '@loadable/component'
import type { RouteObject } from '../types'
import { LayoutGuard } from '../guard'
import { LazyLoad } from '@/components/LazyLoad'

// data module page
const DataRoute: RouteObject = {
  path: '/data',
  name: 'Data',
  element: <LayoutGuard />,
  meta: {
    title: '资料管理',
    icon: 'excel',
    orderNo: 5
  },
  children: [
    {
      path: 'company',
      name: 'CompanyManagement',
      element: LazyLoad(lazy(() => import('@/views/data/company'))),
      meta: {
        title: '保司管理',
        key: 'companyManagement'
      }
    },
    {
      path: 'category',
      name: 'CategoryManagement',
      element: LazyLoad(lazy(() => import('@/views/data/category'))),
      meta: {
        title: '资料分类列表',
        key: 'categoryManagement'
      }
    },
    {
      path: 'article',
      name: 'ArticleManagement',
      element: LazyLoad(lazy(() => import('@/views/data/article'))),
      meta: {
        title: '文章列表',
        key: 'articleManagement'
      }
    },
    {
      path: 'article/preview',
      name: 'ArticlePreview',
      element: LazyLoad(lazy(() => import('@/views/data/article/preview'))),
      meta: {
        title: '文章预览',
        key: 'articlePreview',
        hideMenu: true
      }
    }
  ]
}

export default DataRoute