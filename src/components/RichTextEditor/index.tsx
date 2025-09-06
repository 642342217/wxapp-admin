import { FC, useState, useRef } from 'react'
import { Button, Upload, message, Space, Divider } from 'antd'
import { UploadOutlined, PictureOutlined, VideoCameraOutlined, BoldOutlined, ItalicOutlined, UnderlineOutlined } from '@ant-design/icons'
import { uploadImage, uploadVideo } from '@/api'
import type { UploadFile } from 'antd/es/upload/interface'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  height?: number
}

const RichTextEditor: FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  height = 400
}) => {
  const [content, setContent] = useState(value)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    onChange?.(newContent)
  }

  const insertText = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)

    handleContentChange(newContent)

    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await uploadImage(file)
      const imageTag = `\n![${file.name}](${result.url})\n`
      insertText(imageTag)
      message.success('图片上传成功')
    } catch (error) {
      message.error('图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    setUploading(true)
    try {
      const result = await uploadVideo(file)
      const videoTag = `\n<video controls width="100%" style="max-width: 600px;">\n  <source src="${result.url}" type="${file.type}">\n  您的浏览器不支持视频播放。\n</video>\n`
      insertText(videoTag)
      message.success('视频上传成功')
    } catch (error) {
      message.error('视频上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleFormatText = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let formattedText = ''
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || '粗体文字'}**`
        break
      case 'italic':
        formattedText = `*${selectedText || '斜体文字'}*`
        break
      case 'underline':
        formattedText = `<u>${selectedText || '下划线文字'}</u>`
        break
      default:
        return
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end)
    handleContentChange(newContent)

    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(start, start + formattedText.length)
      } else {
        const textStart = format === 'underline' ? start + 3 : start + (format === 'bold' ? 2 : 1)
        const textEnd = textStart + (format === 'underline' ? '下划线文字'.length : format === 'bold' ? '粗体文字'.length : '斜体文字'.length)
        textarea.setSelectionRange(textStart, textEnd)
      }
    }, 0)
  }

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
      {/* 工具栏 */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #d9d9d9', backgroundColor: '#fafafa' }}>
        <Space wrap>
          <Button
            size="small"
            icon={<BoldOutlined />}
            onClick={() => handleFormatText('bold')}
            title="粗体"
          />
          <Button
            size="small"
            icon={<ItalicOutlined />}
            onClick={() => handleFormatText('italic')}
            title="斜体"
          />
          <Button
            size="small"
            icon={<UnderlineOutlined />}
            onClick={() => handleFormatText('underline')}
            title="下划线"
          />

          <Divider type="vertical" />

          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              handleImageUpload(file)
              return false
            }}
          >
            <Button
              size="small"
              icon={<PictureOutlined />}
              loading={uploading}
              title="上传图片"
            >
              图片
            </Button>
          </Upload>

          <Upload
            accept="video/*"
            showUploadList={false}
            beforeUpload={(file) => {
              handleVideoUpload(file)
              return false
            }}
          >
            <Button
              size="small"
              icon={<VideoCameraOutlined />}
              loading={uploading}
              title="上传视频"
            >
              视频
            </Button>
          </Upload>
        </Space>
      </div>

      {/* 编辑区域 */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        style={{
          width: '100%',
          height: `${height}px`,
          border: 'none',
          outline: 'none',
          padding: '12px',
          resize: 'vertical',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        placeholder="请输入内容，支持 Markdown 语法和 HTML 标签..."
      />
    </div>
  )
}

export default RichTextEditor