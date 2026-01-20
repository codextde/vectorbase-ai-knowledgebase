'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MobileSidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  close: () => void
}

const MobileSidebarContext = createContext<MobileSidebarContextType>({
  isOpen: false,
  setIsOpen: () => {},
  close: () => {},
})

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)
  
  return (
    <MobileSidebarContext.Provider value={{ isOpen, setIsOpen, close }}>
      {children}
    </MobileSidebarContext.Provider>
  )
}

export function useMobileSidebar() {
  return useContext(MobileSidebarContext)
}
