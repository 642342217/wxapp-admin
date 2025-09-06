export interface CustomerDataType {
  id: number
  userId: number
  name: string
  nameEn: string
  number: string
  address: string
  hkType: number
  hkNum: string
  callAddress: string
  phone: string
  country: string
  birthday: string
  zip: string
  gender: number
  smoke: number
  email: string
  high: string
  weigh: string
  degree: number
  status: number
  maritalStatus: number
  createTime: string
}

export interface CustomerPageParams {
  name: string
  pageSize: number
  pageNum: number
}

export interface CustomerPageResult {
  records: CustomerDataType[]
  total: number
  size: number
  current: number
  pages: number
}