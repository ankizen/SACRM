import { useMutation, useQueryClient } from "@tanstack/react-query"
import { leadsApi } from "@/features/leads/leads-api"

export function useChangeLeadStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, leadStageId }: { id: number; leadStageId: number }) => leadsApi.changeStage(id, leadStageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  })
}
