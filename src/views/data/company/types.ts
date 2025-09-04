export interface CompanyDataType {
  id: number
  icon: string
  name: string
  shortName: string
  status: number
  sort: number
  createTime: string
}

export interface CompanyPageParams {
  name?: string
  pageSize: number
  pageNum: number
}

export interface CompanyPageResult {
  records: CompanyDataType[]
  total: number
  size: number
  current: number
  pages: number
}