'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2, Bell, Mail, MessageSquare, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationPreferences {
  emailDigest: boolean
  usageAlerts: boolean
  productUpdates: boolean
  securityAlerts: boolean
}

export function NotificationSettings() {
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailDigest: true,
    usageAlerts: true,
    productUpdates: false,
    securityAlerts: true,
  })

  async function handleSave() {
    setLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    toast.success('Notification preferences saved')
    setLoading(false)
  }

  function updatePreference(key: keyof NotificationPreferences, value: boolean) {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const notifications = [
    {
      id: 'emailDigest',
      title: 'Weekly Email Digest',
      description: 'Receive a weekly summary of your account activity',
      icon: Mail,
    },
    {
      id: 'usageAlerts',
      title: 'Usage Alerts',
      description: 'Get notified when you approach your plan limits',
      icon: TrendingUp,
    },
    {
      id: 'productUpdates',
      title: 'Product Updates',
      description: 'Learn about new features and improvements',
      icon: Bell,
    },
    {
      id: 'securityAlerts',
      title: 'Security Alerts',
      description: 'Important notifications about your account security',
      icon: MessageSquare,
    },
  ] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified about activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <notification.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor={notification.id} className="font-medium cursor-pointer">
                    {notification.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
              <Switch
                id={notification.id}
                checked={preferences[notification.id]}
                onCheckedChange={(checked) => updatePreference(notification.id, checked)}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  )
}
