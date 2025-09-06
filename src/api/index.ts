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

export function updateBankAccountStatus(data: { id: number; status: number }): Promise<any> {
  return service({
    url: '/admin/user/account/status',
    method: 'post',
    data
  })
}

export function updateBankAccountRemark(data: { id: number; remarks: string }): Promise<any> {
  return service({
    url: '/admin/user/remarks',
    method: 'post',
    data
  })
}

// Company management APIs
export function getCompanyList(params: any): Promise<any> {
  return service({
    url: '/admin/company/page',
    method: 'post',
    data: params
  })
}

export function addCompany(data: any): Promise<any> {
  return service({
    url: '/admin/company/add',
    method: 'post',
    data
  })
}

export function updateCompany(data: any): Promise<any> {
  return service({
    url: '/admin/company/edit',
    method: 'post',
    data
  })
}

export function updateCompanyStatus(data: { id: number; status: number }): Promise<any> {
  return service({
    url: '/admin/company/status',
    method: 'post',
    data
  })
}

export function updateCompanySort(data: { id: number; icon: string; name: string; shortName: string; sort: number }): Promise<any> {
  return service({
    url: '/admin/company/edit',
    method: 'post',
    data
  })
}

// Category management APIs
export function getCategoryList(params: any): Promise<any> {
  return service({
    url: '/admin/company/article/category/page',
    method: 'post',
    data: params
  })
}

export function addCategory(data: { companyId: number; name: string }): Promise<any> {
  return service({
    url: '/admin/company/article/category/add',
    method: 'post',
    data
  })
}

export function updateCategory(data: { id: number; companyId: number; name: string }): Promise<any> {
  return service({
    url: '/admin/company/article/category/edit',
    method: 'post',
    data
  })
}

export function updateCategoryStatus(data: { id: number; status: number }): Promise<any> {
  return service({
    url: '/admin/company/article/category/status',
    method: 'post',
    data
  })
}

export function updateCategorySort(data: { id: number; sort: number }): Promise<any> {
  return service({
    url: '/admin/company/article/category/sort',
    method: 'post',
    data
  })
}

// Article management APIs
export function getArticleList(params: any): Promise<any> {
  return service({
    url: '/admin/company/article/page',
    method: 'post',
    data: params
  })
}

export function addArticle(data: any): Promise<any> {
  return service({
    url: '/admin/company/article/add',
    method: 'post',
    data
  })
}

export function updateArticle(data: any): Promise<any> {
  return service({
    url: '/admin/company/article/edit',
    method: 'post',
    data
  })
}

export function updateArticleStatus(data: { id: number; status: number }): Promise<any> {
  return service({
    url: '/admin/company/article/status',
    method: 'post',
    data
  })
}

export function updateArticleSort(data: { id: number; sort: number }): Promise<any> {
  return service({
    url: '/admin/company/article/sort',
    method: 'post',
    data
  })
}

export function updateArticleContent(data: { id: number; content: string }): Promise<any> {
  return service({
    url: '/admin/company/article/content',
    method: 'post',
    data
  })
}

// Mock文件上传接口
export function uploadFile(file: File): Promise<{ url: string }> {
  return new Promise((resolve) => {
    // Mock上传逻辑，实际项目中替换为真实接口
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file)
      resolve({ url: mockUrl })
    }, 1000)
  })
}

export function uploadImage(file: File): Promise<{ url: string }> {
  return uploadFile(file)
}

export function uploadVideo(file: File): Promise<{ url: string }> {
  return uploadFile(file)
}

export function uploadPdf(file: File): Promise<{ url: string }> {
  return uploadFile(file)
}

export function uploadDocument(file: File): Promise<{ url: string }> {
  return uploadFile(file)
}

export function uploadAudio(file: File): Promise<{ url: string }> {
  return uploadFile(file)
}
