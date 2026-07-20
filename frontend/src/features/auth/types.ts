export type UserRole = "MasterAdmin" | "Admin" | "Executive"

export interface CurrentUser {
  id: number
  fullName: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  accessToken: string
  accessTokenExpiresAtUtc: string
  refreshToken: string
  user: CurrentUser
}
