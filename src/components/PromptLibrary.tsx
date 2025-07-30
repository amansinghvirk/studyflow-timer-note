import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash, FileText, Edit, Check, X } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  category: string
  variables: string[]
  createdAt: Date
  isDefault: boolean
}

const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'study-insights',
    name: 'Study Insights',
    description: 'Generate insights and recommendations for study notes',
    template: `As an AI study assistant, analyze these study notes and provide helpful insights:

**Topic**: {topic}
**Subtopic**: {subtopic}

**Notes**:
{notes}

Please provide:
1. **Key Concepts**: Identify and summarize the main concepts
2. **Learning Gaps**: Point out areas that might need more detail or clarification
3. **Connections**: Suggest how these concepts relate to other topics in {topic}
4. **Study Tips**: Recommend specific study strategies for this material
5. **Practice Questions**: Generate 2-3 questions to test understanding

Keep your response concise but actionable. Focus on enhancing learning and retention.`,
    category: 'Analysis',
    variables: ['topic', 'subtopic', 'notes'],
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: 'concept-explanation',
    name: 'Concept Explanation',
    description: 'Explain complex concepts in simple terms',
    template: `Please explain the concept of "{concept}" in the context of {topic} in simple terms.

Include:
- A clear definition
- Key characteristics
- Real-world examples
- Common misconceptions
- How it relates to other concepts in {topic}

Make the explanation accessible to someone learning this for the first time.`,
    category: 'Learning',
    variables: ['concept', 'topic'],
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: 'quiz-generator',
    name: 'Quiz Generator',
    description: 'Generate quiz questions from study material',
    template: `Based on the following study material about {topic}, create a quiz with 5 questions:

**Study Material**:
{notes}

Generate:
- 2 multiple choice questions (with 4 options each)
- 2 short answer questions
- 1 essay question

Include the correct answers for multiple choice and provide answer guidelines for other questions.`,
    category: 'Assessment',
    variables: ['topic', 'notes'],
    createdAt: new Date(),
    isDefault: true
  }
]

interface PromptLibraryProps {
  onSelectPrompt: (template: PromptTemplate) => void
}

export function PromptLibrary({ onSelectPrompt }: PromptLibraryProps) {
  const [prompts, setPrompts] = useKV<PromptTemplate[]>('ai-prompts', DEFAULT_PROMPTS)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPrompt, setNewPrompt] = useState<Partial<PromptTemplate>>({
    name: '',
    description: '',
    template: '',
    category: 'Custom',
    variables: []
  })

  const extractVariables = (template: string): string[] => {
    const matches = template.match(/\{([^}]+)\}/g)
    if (!matches) return []
    return [...new Set(matches.map(match => match.slice(1, -1)))]
  }

  const handleCreatePrompt = () => {
    if (!newPrompt.name || !newPrompt.template) {
      toast.error('Name and template are required')
      return
    }

    const variables = extractVariables(newPrompt.template)
    const prompt: PromptTemplate = {
      id: Date.now().toString(),
      name: newPrompt.name,
      description: newPrompt.description || '',
      template: newPrompt.template,
      category: newPrompt.category || 'Custom',
      variables,
      createdAt: new Date(),
      isDefault: false
    }

    setPrompts(current => [...current, prompt])
    setNewPrompt({ name: '', description: '', template: '', category: 'Custom', variables: [] })
    setIsCreating(false)
    toast.success('Prompt template created successfully')
  }

  const handleEditPrompt = (id: string, updatedPrompt: Partial<PromptTemplate>) => {
    setPrompts(current =>
      current.map(prompt =>
        prompt.id === id
          ? {
              ...prompt,
              ...updatedPrompt,
              variables: updatedPrompt.template ? extractVariables(updatedPrompt.template) : prompt.variables
            }
          : prompt
      )
    )
    setEditingId(null)
    toast.success('Prompt template updated')
  }

  const handleDeletePrompt = (id: string) => {
    setPrompts(current => current.filter(prompt => prompt.id !== id))
    toast.success('Prompt template deleted')
  }

  const categories = [...new Set(prompts.map(p => p.category))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Prompt Library</h3>
          <p className="text-sm text-muted-foreground">
            Manage templates for AI-powered study insights
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus size={16} />
          New Prompt
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Prompt Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prompt-name">Name</Label>
                <Input
                  id="prompt-name"
                  value={newPrompt.name || ''}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter prompt name"
                />
              </div>
              <div>
                <Label htmlFor="prompt-category">Category</Label>
                <Input
                  id="prompt-category"
                  value={newPrompt.category || ''}
                  onChange={(e) => setNewPrompt(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="prompt-description">Description</Label>
              <Input
                id="prompt-description"
                value={newPrompt.description || ''}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the prompt"
              />
            </div>
            
            <div>
              <Label htmlFor="prompt-template">Template</Label>
              <Textarea
                id="prompt-template"
                value={newPrompt.template || ''}
                onChange={(e) => setNewPrompt(prev => ({ ...prev, template: e.target.value }))}
                placeholder="Enter prompt template. Use {variable} for placeholders."
                rows={8}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use curly braces for variables: {'{topic}'}, {'{notes}'}, {'{concept}'}
              </p>
            </div>
            
            {newPrompt.template && (
              <div>
                <Label>Detected Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {extractVariables(newPrompt.template).map(variable => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleCreatePrompt}>
                <Check size={16} className="mr-2" />
                Create Prompt
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X size={16} className="mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {categories.map(category => {
          const categoryPrompts = prompts.filter(p => p.category === category)
          
          return (
            <div key={category}>
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                {category}
              </h4>
              <div className="grid gap-3">
                {categoryPrompts.map(prompt => (
                  <Card key={prompt.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium">{prompt.name}</h5>
                            {prompt.isDefault && (
                              <Badge variant="outline" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {prompt.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {prompt.variables.map(variable => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                          <ScrollArea className="h-20">
                            <p className="text-xs text-muted-foreground font-mono">
                              {prompt.template.slice(0, 200)}
                              {prompt.template.length > 200 && '...'}
                            </p>
                          </ScrollArea>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSelectPrompt(prompt)}
                          >
                            <FileText size={14} />
                          </Button>
                          {!prompt.isDefault && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(prompt.id)}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePrompt(prompt.id)}
                              >
                                <Trash size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}