export interface AccountDataType {
  id: number
  userId: number
  account: string
  password: string
  createTime: string
}

export interface AccountPageParams {
  userId: number
  account?: string
  pageSize: number
  pageNum: number
}

export interface AccountPageResult {
  records: AccountDataType[]
  total: number
  size: number
  current: number
  pages: number
}

export interface AddAccountParams {
  userId: number
  account: string
  password: string
}

export interface UpdateAccountParams {
  id: number
  account: string
  password: string
}