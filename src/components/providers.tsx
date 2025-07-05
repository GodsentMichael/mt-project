"use client"

import { SessionProvider } from "next-auth/react"
import { SettingsProvider } from "@/contexts/settings-context"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </SessionProvider>
  )
}
