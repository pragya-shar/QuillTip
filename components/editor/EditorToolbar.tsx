'use client'

import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image,
  Type,
  ChevronDown,
  Undo,
  Redo,
  Youtube
} from 'lucide-react'
import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ImageUploadDialog } from './ImageUploadDialog'
import { YouTubeEmbedDialog } from './YouTubeEmbedDialog'

interface EditorToolbarProps {
  editor: Editor | null
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({ onClick, isActive = false, disabled = false, children, title }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded hover:bg-gray-100 transition-colors
        ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showYouTubeDialog, setShowYouTubeDialog] = useState(false)

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
  }

  const handleImageSelect = (url: string) => {
    editor.chain().focus().setResizableImage({ src: url }).run()
  }

  const handleVideoEmbed = (url: string, width?: number, height?: number) => {
    if ('setYoutubeVideo' in editor.commands) {
      editor.commands.setYoutubeVideo({ 
        src: url,
        width: width || 640,
        height: height || 480
      })
    } else {
      console.error('setYoutubeVideo command not available')
      alert('YouTube extension not properly loaded. Please refresh the page.')
    }
  }

  const headingOptions = [
    { level: 0, label: 'Normal Text', command: () => editor.chain().focus().setParagraph().run() },
    { level: 1, label: 'Heading 1', command: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { level: 2, label: 'Heading 2', command: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { level: 3, label: 'Heading 3', command: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { level: 4, label: 'Heading 4', command: () => editor.chain().focus().toggleHeading({ level: 4 }).run() },
    { level: 5, label: 'Heading 5', command: () => editor.chain().focus().toggleHeading({ level: 5 }).run() },
    { level: 6, label: 'Heading 6', command: () => editor.chain().focus().toggleHeading({ level: 6 }).run() },
  ]

  const getCurrentHeading = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) {
        return `Heading ${i}`
      }
    }
    return 'Normal Text'
  }

  return (
    <div className="border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap bg-gray-50">
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Heading Dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
            <Type className="w-4 h-4" />
            <span className="text-sm">{getCurrentHeading()}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {headingOptions.map(option => (
              <DropdownMenu.Item
                key={option.level}
                onSelect={option.command}
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer outline-none"
              >
                {option.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ToolbarDivider />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline"
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Link */}
      <div className="relative">
        {editor.isActive('link') ? (
          <ToolbarButton
            onClick={removeLink}
            isActive={true}
            title="Remove Link"
          >
            <Link2 className="w-4 h-4" />
          </ToolbarButton>
        ) : (
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            title="Add Link"
          >
            <Link2 className="w-4 h-4" />
          </ToolbarButton>
        )}
        {showLinkInput && (
          <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
            <input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addLink()
                } else if (e.key === 'Escape') {
                  setShowLinkInput(false)
                  setLinkUrl('')
                }
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <button
              onClick={addLink}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Image */}
      <ToolbarButton
        onClick={() => setShowImageDialog(true)}
        title="Add Image"
      >
        <Image className="w-4 h-4" />
      </ToolbarButton>

      {/* YouTube Video */}
      <ToolbarButton
        onClick={() => setShowYouTubeDialog(true)}
        title="Embed YouTube Video"
      >
        <Youtube className="w-4 h-4" />
      </ToolbarButton>
      
      <ImageUploadDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageSelect={handleImageSelect}
      />

      <YouTubeEmbedDialog
        isOpen={showYouTubeDialog}
        onClose={() => setShowYouTubeDialog(false)}
        onVideoEmbed={handleVideoEmbed}
      />
    </div>
  )
}