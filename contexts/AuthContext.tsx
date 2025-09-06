"use client"

import React, { createContext, useContext, useMemo } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'

export interface AuthUser {
  id: string
  email?: string | null
  user_metadata?: any
  app_metadata?: any
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const clerk = useClerk()
  const signOut = async () => {
    if (clerk) await clerk.signOut()
  }

  const authUser: AuthUser | null = useMemo(() => {
    if (!isLoaded || !isSignedIn || !user) return null
    return {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || null,
    user_metadata: (user as any).privateMetadata || {},
    app_metadata: (user as any).publicMetadata || {},
    }
  }, [isLoaded, isSignedIn, user])

  const value: AuthContextType = {
    user: authUser,
    loading: !isLoaded,
    signOut: async () => {
      await signOut()
    },
    refreshUser: async () => {
      // Clerk manages user state; no-op here but kept for compatibility
      return
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
