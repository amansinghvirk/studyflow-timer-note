import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Underline } from '@tiptap/extension-underline'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
  Smiley,
  MagicWand,
  Sparkle
} from '@phosphor-icons/react'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { generateLiveSuggestions } from '@/lib/ai'
import type { AppSettings } from '@/App'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  editorHeight?: string
  showAIFeatures?: boolean
  settings?: AppSettings
  topic?: string
  subtopic?: string
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

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder, 
  className, 
  editorHeight = "200px",
  showAIFeatures = false,
  settings,
  topic,
  subtopic
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState('')
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
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
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 overflow-auto',
        style: `min-height: ${editorHeight}; max-height: calc(100vh - 300px);`,
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

  const generateAISuggestions = useCallback(async () => {
    if (!settings?.aiSettings?.enabled || !settings?.aiSettings?.apiKey || !topic || !subtopic) {
      toast.error('AI features not configured or topic/subtopic missing')
      return
    }

    if (!content.trim()) {
      toast.error('Please write some notes first to get AI suggestions')
      return
    }

    setIsGeneratingAI(true)
    
    try {
      const result = await generateLiveSuggestions(
        content,
        topic,
        subtopic,
        settings.aiSettings
      )

      if (result.success && result.suggestions) {
        setAiSuggestions(result.suggestions)
        setShowAISuggestions(true)
        toast.success('AI suggestions generated!')
      } else {
        toast.error(result.error || 'Failed to generate AI suggestions')
      }
    } catch (error) {
      toast.error('Failed to connect to AI service')
      console.error('AI suggestions error:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }, [content, topic, subtopic, settings?.aiSettings])

  const insertAISuggestion = useCallback((suggestion: string) => {
    if (!editor) return
    
    // Insert the suggestion at the current cursor position with better formatting
    const currentPos = editor.state.selection.from
    const formattedSuggestion = `\n\n**💡 AI Suggestion:**\n${suggestion}\n\n`
    
    editor.chain()
      .focus()
      .setTextSelection(currentPos)
      .insertContent(formattedSuggestion)
      .run()
      
    setShowAISuggestions(false)
    toast.success('AI suggestion added to notes')
  }, [editor])

  const generateQuickInsight = useCallback(async () => {
    if (!settings?.aiSettings?.enabled || !settings?.aiSettings?.apiKey || !topic || !subtopic) {
      toast.error('AI features not configured')
      return
    }

    if (!content.trim()) {
      toast.error('Please write some notes first')
      return
    }

    setIsGeneratingAI(true)
    
    try {
      const sparkPrompt = spark.llmPrompt`Provide a quick learning insight about these study notes on ${topic} - ${subtopic}:

${content}

Give one actionable tip to improve understanding or retention of this material. Keep it concise and specific.`

      const insight = await spark.llm(sparkPrompt, 'gpt-4o-mini')
      
      if (insight) {
        // Insert insight directly into the editor
        const formattedInsight = `\n\n**🧠 Quick Insight:**\n${insight}\n\n`
        editor?.chain().focus().insertContent(formattedInsight).run()
        toast.success('Learning insight added!')
      }
    } catch (error) {
      toast.error('Failed to generate insight')
      console.error('Quick insight error:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }, [content, topic, subtopic, settings?.aiSettings, editor])

  const applyColor = useCallback((color: string) => {
    if (!editor) return
    editor.chain().focus().setColor(color).run()
    setSelectedColor(color)
  }, [editor])

  // Check if AI features should be available
  const isAIAvailable = showAIFeatures && 
                       settings?.aiSettings?.enabled && 
                       settings?.aiSettings?.apiKey && 
                       topic && 
                       subtopic

  if (!editor) {
    return null
  }

  return (
    <div className={`space-y-4 h-full flex flex-col ${className || ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md bg-muted/50 flex-shrink-0">
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

        {/* AI Features */}
        {isAIAvailable && (
          <>
            <Separator orientation="vertical" className="h-6" />
            
            {/* AI Enhancement */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={generateAISuggestions}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1"
                  >
                    {isGeneratingAI ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <MagicWand size={16} className="text-violet-600" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Get AI suggestions for your notes</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Quick Insight */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={generateQuickInsight}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1"
                  >
                    {isGeneratingAI ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkle size={16} className="text-blue-600" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate quick learning insight</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* AI Suggestions Panel */}
            {showAISuggestions && (
              <Popover open={showAISuggestions} onOpenChange={setShowAISuggestions}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-violet-600">
                    <MagicWand size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 max-h-96 overflow-auto">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MagicWand size={16} className="text-violet-600" />
                      <Label className="font-medium">AI Suggestions</Label>
                    </div>
                    <div className="prose prose-sm text-sm whitespace-pre-wrap">
                      {aiSuggestions}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => insertAISuggestion(aiSuggestions)}
                        className="flex items-center gap-1"
                      >
                        <MagicWand size={12} />
                        Add to Notes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowAISuggestions(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </>
        )}
      </div>

      {/* Editor */}
      <div className="border rounded-md focus-within:ring-2 focus-within:ring-ring flex-1 overflow-hidden">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
          className="font-body h-full"
        />
      </div>
    </div>
  )
}