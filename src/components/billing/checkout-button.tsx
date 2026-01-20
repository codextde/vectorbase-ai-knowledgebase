'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface CheckoutButtonProps {
  planId: string
  currentPlanPrice: number
  planPrice: number
  isPopular?: boolean
}

export function CheckoutButton({ 
  planId, 
  currentPlanPrice, 
  planPrice, 
  isPopular 
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingInterval: 'monthly' }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout error:', data.error)
        alert(data.error || 'Failed to start checkout')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      className="w-full" 
      variant={isPopular ? 'default' : 'outline'}
      onClick={handleCheckout}
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {planPrice > currentPlanPrice ? 'Upgrade' : 'Downgrade'}
    </Button>
  )
}
