import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { followupsApi } from "./followups-api"
import type { FollowupCreateRequest, FollowupUpdateRequest } from "./types"

export function useFollowups(leadId: number) {
  return useQuery({
    queryKey: ["leads", leadId, "followups"],
    queryFn: () => followupsApi.list(leadId),
    enabled: Number.isFinite(leadId),
  })
}

export function useCreateFollowup(leadId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: FollowupCreateRequest) => followupsApi.create(leadId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "followups"] })
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "timeline"] })
    },
  })
}

export function useUpdateFollowup(leadId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: FollowupUpdateRequest }) => followupsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "followups"] })
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "timeline"] })
    },
  })
}
