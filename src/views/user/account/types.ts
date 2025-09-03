export interface AccountDataType {
  id: number
  userId: number
  accountName: string
  accountType: string
  balance: number
  status: number
  createTime: string
  remark?: string
}

export interface AccountPageParams {
  userId: number
  accountName?: string
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
  accountName: string
  accountType: string
  balance: number
  remark?: string
}

export interface UpdateAccountParams {
  id: number
  accountName: string
  accountType: string
  balance: number
  remark?: string
}