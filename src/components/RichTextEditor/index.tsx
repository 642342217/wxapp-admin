import { FC, useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { message } from 'antd'
import { uploadImage, uploadVideo, uploadPdf } from '@/api'

// 引入css
import '@wangeditor/editor/dist/css/style.css'

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
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [html, setHtml] = useState(value)

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: [
      'headerSelect',
      '|',
      'bold',
      'italic',
      'underline',
      'through',
      'color',
      'bgColor',
      '|',
      'fontSize',
      'fontFamily',
      'lineHeight',
      '|',
      'bulletedList',
      'numberedList',
      'todo',
      '|',
      'emotion',
      'insertLink',
      'uploadImage',
      'uploadVideo',
      'insertTable',
      'codeBlock',
      '|',
      'undo',
      'redo',
      '|',
      'fullScreen'
    ]
  }

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
    MENU_CONF: {
      // 配置上传图片
      uploadImage: {
        async customUpload(file: File, insertFn: Function) {
          try {
            const result = await uploadImage(file)
            insertFn(result.url, file.name, result.url)
            message.success('图片上传成功')
          } catch (error) {
            message.error('图片上传失败')
          }
        }
      },
      // 配置上传视频
      uploadVideo: {
        async customUpload(file: File, insertFn: Function) {
          try {
            const result = await uploadVideo(file)
            insertFn(result.url)
            message.success('视频上传成功')
          } catch (error) {
            message.error('视频上传失败')
          }
        }
      }
    }
  }

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  // 监听外部value变化
  useEffect(() => {
    if (value !== html) {
      setHtml(value)
    }
  }, [value])

  const handleChange = (editor: IDomEditor) => {
    const newHtml = editor.getHtml()
    setHtml(newHtml)
    onChange?.(newHtml)
  }

  const handlePdfUpload = async (file: File) => {
    try {
      const result = await uploadPdf(file)
      const pdfHtml = `<a style="display: inline-flex; align-items: center; gap: 8px; margin: 5px 0;">
        <span style="font-size: 16px;">📄</span>
        <span style="color: #ff8c00; font-weight: 500;">${file.name}</span>
      </a>`

      if (editor) {
        editor.dangerouslyInsertHtml(pdfHtml)
        message.success('PDF上传成功')
      }
    } catch (error) {
      message.error('PDF上传失败')
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
      <div style={{ borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode="default"
          style={{ flex: 1, border: 'none' }}
        />
        <div style={{ padding: '0 8px', borderLeft: '1px solid #ccc' }}>
          <input
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            id="pdf-upload-input"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handlePdfUpload(file)
                e.target.value = ''
              }
            }}
          />
          <button
            type="button"
            onClick={() => document.getElementById('pdf-upload-input')?.click()}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '3px',
              fontSize: '14px',
              color: '#666'
            }}
            title="上传PDF"
          >
            📄 PDF
          </button>
        </div>
      </div>
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={handleChange}
        mode="default"
        style={{ height: `${height}px`, overflowY: 'hidden' }}
      />
    </div>
  )
}

export default RichTextEditor