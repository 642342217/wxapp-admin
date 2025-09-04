export interface BankAccountDataType {
  id: number
  account: string
  bank: string
  status: number
  fastNum: string
  remarks: string | null
  userId: number
  createTime: string
}

export interface BankAccountPageParams {
  userId: number
  account?: string
  pageSize: number
  pageNum: number
}

export interface BankAccountPageResult {
  records: BankAccountDataType[]
  total: number
  size: number
  current: number
  pages: number
}