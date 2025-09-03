import type { AppMenu } from '../types'
import { basicRoutes } from '..'
import { transformRouteToMenu } from '../helpers'

// 递归过滤隐藏的菜单项
function filterHiddenMenus(menus: AppMenu[]): AppMenu[] {
  return menus.filter(menu => {
    if (menu.hideMenu) {
      return false
    }
    if (menu.children && menu.children.length > 0) {
      menu.children = filterHiddenMenus(menu.children)
    }
    return true
  })
}

// Get async menus
export async function getAsyncMenus(): Promise<AppMenu[]> {
  const staticMenus = transformRouteToMenu(basicRoutes)
  staticMenus.sort((a, b) => {
    return (a?.orderNo || staticMenus.length) - (b?.orderNo || staticMenus.length)
  })

  return filterHiddenMenus(staticMenus)
}
