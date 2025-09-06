export interface ArticleDataType {
  id: number
  companyId: number
  name: string
  icon: string
  content: string
  categoryId: number
  status: number
  sort: number
  createTime: string
}

export interface ArticlePageParams {
  name?: string
  pageSize: number
  pageNum: number
}

export interface ArticlePageResult {
  records: ArticleDataType[]
  total: number
  size: number
  current: number
  pages: number
}