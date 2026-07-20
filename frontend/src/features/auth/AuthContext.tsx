import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authApi } from "./auth-api"
import { authStorage } from "@/lib/auth-storage"
import { queryClient } from "@/app/query-client"
import type { CurrentUser } from "./types"

interface AuthContextValue {
  user: CurrentUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const storedUser = authStorage.getUser()
      if (!storedUser || !authStorage.getAccessToken()) {
        setIsLoading(false)
        return
      }

      // Optimistic paint from cache, then validate against the server. A failing /me
      // (even after the interceptor's silent refresh attempt) means the session is gone.
      setUser(storedUser)
      try {
        const freshUser = await authApi.me()
        setUser(freshUser)
      } catch {
        authStorage.clear()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()

    const handleAuthExpired = () => {
      queryClient.clear()
      setUser(null)
    }
    window.addEventListener("sacrm:auth-expired", handleAuthExpired)
    return () => window.removeEventListener("sacrm:auth-expired", handleAuthExpired)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    authStorage.setSession(response.accessToken, response.refreshToken, response.user)
    // The query cache is a singleton for the app's lifetime — without clearing it here,
    // logging in as a different user in the same tab would render the previous user's
    // cached query results (dashboard numbers, lead lists, ...) until they went stale.
    queryClient.clear()
    setUser(response.user)
  }

  const logout = async () => {
    const refreshToken = authStorage.getRefreshToken()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // best-effort — the token gets discarded client-side regardless
      }
    }
    authStorage.clear()
    queryClient.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
