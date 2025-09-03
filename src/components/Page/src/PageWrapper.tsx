import SvgIcon from '@/components/SvgIcon'
import compoStyle from './compo.module.less'

interface PluginProp {
  name?: string
  desc?: string
  url?: string
}

interface PageProp {
  plugin: PluginProp
  children: JSX.Element
}

const PageWrapper = (props: PageProp) => {
  return (
    <div className={compoStyle['compo_page-wrapper']}>
      {/* <div className={compoStyle['page-header']}>
        <div className={compoStyle['page-header-name']}>
          <SvgIcon name='hints' size={18} />
          <span>{props.plugin?.name}</span>
        </div>
        <p>{props.plugin?.desc}</p>
      </div> */}
      <div className={compoStyle['page-content']}>{props.children}</div>
    </div>
  )
}

export default PageWrapper
