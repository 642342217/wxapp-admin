export interface UserDataType {
  id: number
  name: string
  gender: number
  age: number
  telephone: string
  status: number
  createTime: string
  remarks?: string
}

export interface UserPageParams {
  name: string
  pageSize: number
  pageNum: number
}

export interface UserPageResult {
  records: UserDataType[]
  total: number
  size: number
  current: number
  pages: number
}

export interface UpdateUserStatusParams {
  id: number
  status: number
}