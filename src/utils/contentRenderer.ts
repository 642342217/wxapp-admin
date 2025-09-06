// 将内容转换为HTML格式，主要处理换行符
export function renderContent(content: string): string {
  if (!content) return ''

  // 如果内容已经包含HTML标签，直接返回
  if (/<[^>]*>/g.test(content)) {
    return content
  }

  // 处理纯文本内容的换行符
  let html = content
    .replace(/\n/g, '<br>')
    .replace(/(<br>){3,}/g, '<br><br>')

  return html
}

// 获取内容的纯文本预览（用于表格显示）
export function getContentPreview(content: string, maxLength: number = 50): string {
  if (!content) return '暂无内容'

  // 移除HTML标签
  const plainText = content
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/\n+/g, ' ') // 将换行符替换为空格
    .trim()

  return plainText.length > maxLength
    ? plainText.substring(0, maxLength) + '...'
    : plainText
}