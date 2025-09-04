import { service } from '@/utils/axios'

interface LoginParams {
  account: string
  password: string
  code?: string
  codeKey?: string
}

// Get captcha api
export function getCaptcha(params = {}): Promise<any> {
  return service({
    url: '/common/captcha/get',
    method: 'get',
    data: params,
    responseType: 'blob'
  }).then(response => {
    // 获取响应头中的captchaKey
    const captchaKey = response.headers?.['captchakey'] || response.headers?.['captchaKey'];

    // 创建图片URL
    const imageUrl = URL.createObjectURL(response.data);

    return {
      captchaKey,
      imageUrl,
      imageBlob: response.data
    };
  });
}

// User login api
export function loginApi(data: LoginParams): Promise<any> {
  return service({
    url: '/auth/admin/login',
    method: 'post',
    data
  })
}

// Get User info
export function getUserInfo(): Promise<any> {
  return service({
    url: '/auth/admin/info',
    method: 'post'
  })
}

// Change password api
export function changePasswordApi(data: { oldPassword: string; newPassword: string }): Promise<any> {
  return service({
    url: '/auth/admin/changePassword',
    method: 'post',
    data
  })
}

// User logout api
export function logoutApi() {
  return service({
    url: '/auth/admin/logout',
    method: 'post'
  })
}

// Table list
export function getTableList(params: any) {
  return service({
    url: '/table/getTableList',
    method: 'post',
    data: params
  })
}

// User management APIs
export function getUserList(params: any): Promise<any> {
  return service({
    url: '/admin/user/page',
    method: 'post',
    data: params
  })
}

export function updateUserStatus(data: { id: number; status: number }): Promise<any> {
  return service({
    url: '/admin/user/status',
    method: 'post',
    data
  })
}

export function addUser(data: any): Promise<any> {
  return service({
    url: '/admin/user/add',
    method: 'post',
    data
  })
}

export function updateUser(data: any): Promise<any> {
  return service({
    url: '/admin/user/edit',
    method: 'post',
    data
  })
}

export function updateUserRemark(data: { id: number; remarks: string }): Promise<any> {
  return service({
    url: '/admin/user/remarks',
    method: 'post',
    data
  })
}

// Account management APIs
export function getAccountList(params: any): Promise<any> {
  return service({
    url: '/admin/user/auth/page',
    method: 'post',
    data: params
  })
}

export function addAccount(data: any): Promise<any> {
  return service({
    url: '/admin/account/add',
    method: 'post',
    data
  })
}

export function updateAccount(data: any): Promise<any> {
  return service({
    url: '/admin/account/edit',
    method: 'post',
    data
  })
}

export function deleteAccount(data: { id: number }): Promise<any> {
  return service({
    url: '/admin/account/delete',
    method: 'post',
    data
  })
}

// Bank Account management APIs
export function getBankAccountList(params: any): Promise<any> {
  return service({
    url: '/admin/user/account/page',
    method: 'post',
    data: params
  })
}

export function addBankAccount(data: any): Promise<any> {
  return service({
    url: '/admin/bank/add',
    method: 'post',
    data
  })
}

export function updateBankAccount(data: any): Promise<any> {
  return service({
    url: '/admin/bank/edit',
    method: 'post',
    data
  })
}

export function deleteBankAccount(data: { id: number }): Promise<any> {
  return service({
    url: '/admin/bank/delete',
    method: 'post',
    data
  })
}
