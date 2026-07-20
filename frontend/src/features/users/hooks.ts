import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usersApi, type UserCreateRequest, type UserUpdateRequest } from "./users-api"

// Assign-to dropdowns (Leads) default to active-only; the Users management
// screen passes includeInactive=true so admins can see and reactivate deactivated accounts.
export function useUsers(enabled = true, includeInactive = false) {
  return useQuery({
    queryKey: ["users", includeInactive],
    queryFn: () => usersApi.list(includeInactive),
    enabled,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UserCreateRequest) => usersApi.create(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: UserUpdateRequest }) => usersApi.update(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}
