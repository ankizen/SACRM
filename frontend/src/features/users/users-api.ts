import { api } from "@/lib/api"
import type { AppUser } from "./types"

export const usersApi = {
  list: (includeInactive = false) =>
    api.get<AppUser[]>("/users", { params: { includeInactive } }).then((r) => r.data),
}
