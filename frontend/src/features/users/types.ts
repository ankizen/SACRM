import type { UserRole } from "@/features/auth/types"

export interface AppUser {
  id: number
  fullName: string
  email: string
  phoneNumber: string | null
  role: UserRole
  isActive: boolean
  lastLoginAtUtc: string | null
  createdAtUtc: string
}
