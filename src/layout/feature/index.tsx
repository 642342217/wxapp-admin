import { Divider } from 'antd'
import { UserDropdown } from './components'
import moduleStyle from './index.module.less'

export default function LayoutFeature() {
  const prefixCls = 'layout_feature'

  return (
    <div className={moduleStyle[prefixCls]}>
      <div className={moduleStyle[`${prefixCls}-main`]}>
        {/* <AppSearch /> */}
        {/* <AppLocalePicker /> */}
      </div>
      <Divider type='vertical' className={moduleStyle[`${prefixCls}-divider`]} />
      <UserDropdown />
    </div>
  )
}
