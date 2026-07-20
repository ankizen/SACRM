import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { leadsApi } from "./leads-api"
import type { LeadFormValues, LeadListQuery } from "./types"

export function useLeads(query: LeadListQuery) {
  return useQuery({
    queryKey: ["leads", query],
    queryFn: () => leadsApi.list(query),
    placeholderData: (previous) => previous,
  })
}

export function useLead(id: number) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: () => leadsApi.get(id),
    enabled: Number.isFinite(id),
  })
}

export function useLeadTimeline(id: number, pageNumber = 1) {
  return useQuery({
    queryKey: ["leads", id, "timeline", pageNumber],
    queryFn: () => leadsApi.timeline(id, { pageNumber, pageSize: 20 }),
    enabled: Number.isFinite(id),
  })
}

export function useDuplicateCheck() {
  return useMutation({
    mutationFn: (params: { phone?: string; email?: string; gstNumber?: string }) => leadsApi.duplicateCheck(params),
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: LeadFormValues) => leadsApi.create(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  })
}

export function useUpdateLead(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: LeadFormValues & { rowVersion: string }) => leadsApi.update(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => leadsApi.softDelete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  })
}

export function useRestoreLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => leadsApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  })
}

export function useAssignLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, assignedToUserId }: { id: number; assignedToUserId: number }) =>
      leadsApi.assign(id, assignedToUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  })
}

export function useBulkUpdateLeads() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ leadIds, ...patch }: { leadIds: number[]; leadStageId?: number; assignedToUserId?: number }) =>
      leadsApi.bulkUpdate(leadIds, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  })
}

export function useMergeLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, duplicateLeadId }: { id: number; duplicateLeadId: number }) =>
      leadsApi.merge(id, duplicateLeadId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  })
}
