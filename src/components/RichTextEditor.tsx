import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  TextB, 
  TextItalic, 
  TextUnderline, 
  TextStrikethrough,
  ListBullets,
  ListNumbers,
  Quotes,
  Link as LinkIcon,
  Image as ImageIcon,
  Palette,
  Smiley
} from '@phosphor-icons/react'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const PRESET_COLORS = [
  '#000000', '#374151', '#ef4444', '#f97316', 
  '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4'
]

const EMOJI_STICKERS = [
  '📝', '💡', '⭐', '🔥', '✅', '❗', '💭', '🎯',
  '📚', '🧠', '⚡', '🎉', '👍', '❤️', '🚀', '💪'
]

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [selectedColor, setSelectedColor] = useState('#000000')

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border rounded-md',
      },
    },
  })

  const addLink = useCallback(() => {
    if (!linkUrl || !editor) return
    
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, '')
    
    if (selectedText) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkUrl}</a>`).run()
    }
    
    setLinkUrl('')
    toast.success('Link added')
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!imageUrl || !editor) return
    
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
    toast.success('Image added')
  }, [editor, imageUrl])

  const addEmoji = useCallback((emoji: string) => {
    if (!editor) return
    editor.chain().focus().insertContent(emoji).run()
  }, [editor])

  const applyColor = useCallback((color: string) => {
    if (!editor) return
    editor.chain().focus().setColor(color).run()
    setSelectedColor(color)
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md bg-muted/50">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <TextB size={16} />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <TextItalic size={16} />
          </Button>
          <Button
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <TextUnderline size={16} />
          </Button>
          <Button
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <TextStrikethrough size={16} />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListBullets size={16} />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListNumbers size={16} />
          </Button>
          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quotes size={16} />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Palette size={16} />
              <div 
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: selectedColor }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => applyColor(color)}
                />
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <Label htmlFor="custom-color" className="text-xs">Custom Color</Label>
              <Input
                id="custom-color"
                type="color"
                value={selectedColor}
                onChange={(e) => applyColor(e.target.value)}
                className="w-full h-8"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <LinkIcon size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <Label htmlFor="link-url">Add Link</Label>
              <div className="flex gap-2">
                <Input
                  id="link-url"
                  placeholder="Enter URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLink()}
                />
                <Button onClick={addLink} size="sm">Add</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <ImageIcon size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <Label htmlFor="image-url">Add Image</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addImage()}
                />
                <Button onClick={addImage} size="sm">Add</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Emoji Stickers */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Smiley size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <Label>Stickers</Label>
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_STICKERS.map((emoji) => (
                  <button
                    key={emoji}
                    className="p-2 text-lg hover:bg-muted rounded transition-colors"
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor */}
      <div className="border rounded-md min-h-[200px] focus-within:ring-2 focus-within:ring-ring">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
          className="font-body"
        />
      </div>
    </div>
  )
}