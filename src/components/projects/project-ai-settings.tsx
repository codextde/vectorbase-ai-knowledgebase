'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Loader2, Bot, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { ProjectSettings } from '@/types/database'

interface ProjectAiSettingsProps {
  projectId: string
  settings: Partial<ProjectSettings>
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. Answer questions based on the provided context. 
If you cannot find the answer in the context, say so politely. 
Always be accurate and cite information from the context when possible.`

export function ProjectAiSettings({ projectId, settings }: ProjectAiSettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  const [systemPrompt, setSystemPrompt] = useState(settings.system_prompt || DEFAULT_SYSTEM_PROMPT)
  const [chatModel, setChatModel] = useState<string>(settings.chat_model || 'gpt-4o-mini')
  const [temperature, setTemperature] = useState(settings.temperature ?? 0.7)
  const [maxTokens, setMaxTokens] = useState(settings.max_tokens || 1000)

  async function handleSave() {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          settings: {
            ...settings,
            system_prompt: systemPrompt,
            chat_model: chatModel,
            temperature,
            max_tokens: maxTokens,
          },
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', projectId)

      if (error) throw error

      toast.success('AI settings saved')
      router.refresh()
    } catch (error) {
      toast.error('Failed to save AI settings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function resetToDefaults() {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT)
    setChatModel('gpt-4o-mini')
    setTemperature(0.7)
    setMaxTokens(1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Configuration
        </CardTitle>
        <CardDescription>
          Customize how your AI assistant responds to queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Instructions for the AI..."
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This prompt sets the behavior and personality of your AI assistant.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="chatModel">Chat Model</Label>
              <Select value={chatModel} onValueChange={setChatModel}>
                <SelectTrigger id="chatModel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      GPT-4o Mini (Fast & Affordable)
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt-4o">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      GPT-4o (Most Capable)
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt-4-turbo">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      GPT-4 Turbo (Balanced)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Response Tokens</Label>
              <Select value={maxTokens.toString()} onValueChange={(v) => setMaxTokens(parseInt(v))}>
                <SelectTrigger id="maxTokens">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500 tokens (Short)</SelectItem>
                  <SelectItem value="1000">1,000 tokens (Medium)</SelectItem>
                  <SelectItem value="2000">2,000 tokens (Long)</SelectItem>
                  <SelectItem value="4000">4,000 tokens (Very Long)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperature: {temperature.toFixed(1)}</Label>
              <span className="text-xs text-muted-foreground">
                {temperature < 0.3 ? 'More focused' : temperature > 0.7 ? 'More creative' : 'Balanced'}
              </span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(v: number[]) => setTemperature(v[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower values produce more deterministic responses, higher values produce more varied responses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save AI Settings
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
