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
    method: 'post',
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
