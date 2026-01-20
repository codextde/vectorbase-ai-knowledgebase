'use client'

import { useRouter } from 'next/navigation'
import { Confetti } from '@/components/ui/confetti'

interface BillingSuccessConfettiProps {
  showSuccess: boolean
}

export function BillingSuccessConfetti({ showSuccess }: BillingSuccessConfettiProps) {
  const router = useRouter()

  const handleComplete = () => {
    router.replace('/dashboard/billing', { scroll: false })
  }

  return <Confetti trigger={showSuccess} onComplete={handleComplete} />
}
