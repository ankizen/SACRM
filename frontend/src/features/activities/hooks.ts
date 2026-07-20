import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { activitiesApi } from "./activities-api"
import type { ActivityCreateRequest } from "./types"

export function useActivities(leadId: number) {
  return useQuery({
    queryKey: ["leads", leadId, "activities"],
    queryFn: () => activitiesApi.list(leadId),
    enabled: Number.isFinite(leadId),
  })
}

export function useCreateActivity(leadId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: ActivityCreateRequest) => activitiesApi.create(leadId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "activities"] })
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "timeline"] })
    },
  })
}
