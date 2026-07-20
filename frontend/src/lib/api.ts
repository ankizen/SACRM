import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import type { AuthResponse } from "@/features/auth/types"
import { authStorage } from "./auth-storage"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5024/api",
})

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Phase 2's refresh endpoint rotates tokens (the old refresh token is revoked on use),
// so concurrent 401s must share one in-flight refresh call, not fire one each.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken()
  if (!refreshToken) {
    return null
  }

  try {
    const response = await axios.post<AuthResponse>(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
    authStorage.setSession(response.data.accessToken, response.data.refreshToken, response.data.user)
    return response.data.accessToken
  } catch {
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/refresh")

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null
    })

    const newAccessToken = await refreshPromise

    if (!newAccessToken) {
      authStorage.clear()
      window.dispatchEvent(new Event("sacrm:auth-expired"))
      return Promise.reject(error)
    }

    originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`)
    return api(originalRequest)
  },
)
