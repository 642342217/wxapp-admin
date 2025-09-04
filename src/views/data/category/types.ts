export interface CategoryDataType {
  id: number
  companyId: number
  name: string
  sort: number
  status: number
  createTime: string
}

export interface CategoryPageParams {
  pageSize: number
  pageNum: number
}

export interface CategoryPageResult {
  records: CategoryDataType[]
  total: number
  size: number
  current: number
  pages: number
}