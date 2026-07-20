import { api } from "@/lib/api"
import type { AuthResponse, CurrentUser } from "./types"

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((res) => res.data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken }).then((res) => res.data),

  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),

  me: () => api.get<CurrentUser>("/auth/me").then((res) => res.data),
}
