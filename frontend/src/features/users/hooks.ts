import { useQuery } from "@tanstack/react-query"
import { usersApi } from "./users-api"

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
    enabled,
  })
}
