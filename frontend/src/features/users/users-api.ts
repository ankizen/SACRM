import { api } from "@/lib/api"
import type { AppUser } from "./types"

export interface UserCreateRequest {
  fullName: string
  email: string
  password: string
  phoneNumber?: string
  role: "Admin" | "Executive"
}

export interface UserUpdateRequest {
  fullName: string
  phoneNumber?: string
  isActive: boolean
}

export const usersApi = {
  list: (includeInactive = false) =>
    api.get<AppUser[]>("/users", { params: { includeInactive } }).then((r) => r.data),

  create: (values: UserCreateRequest) => api.post<AppUser>("/users", values).then((r) => r.data),

  update: (id: number, values: UserUpdateRequest) => api.put(`/users/${id}`, values).then(() => undefined),
}
