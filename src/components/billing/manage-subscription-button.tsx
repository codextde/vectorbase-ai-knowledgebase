'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Settings } from 'lucide-react'

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handlePortal = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Portal error:', data.error)
        alert(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handlePortal} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Settings className="mr-2 h-4 w-4" />
      )}
      Manage Subscription
    </Button>
  )
}
