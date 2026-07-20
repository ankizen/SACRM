import { api } from "@/lib/api"
import type { Lead, LeadFormValues, LeadListItem, LeadListQuery, LeadTimelineEntry, PagedResult } from "./types"

export const leadsApi = {
  list: (query: LeadListQuery) =>
    api.get<PagedResult<LeadListItem>>("/leads", { params: query }).then((r) => r.data),

  get: (id: number) => api.get<Lead>(`/leads/${id}`).then((r) => r.data),

  create: (values: LeadFormValues) => api.post<Lead>("/leads", values).then((r) => r.data),

  update: (id: number, values: LeadFormValues & { rowVersion: string }) =>
    api.put<Lead>(`/leads/${id}`, values).then((r) => r.data),

  softDelete: (id: number) => api.delete(`/leads/${id}`),

  restore: (id: number) => api.post(`/leads/${id}/restore`),

  assign: (id: number, assignedToUserId: number) => api.post(`/leads/${id}/assign`, { assignedToUserId }),

  bulkUpdate: (leadIds: number[], patch: { leadStageId?: number; assignedToUserId?: number }) =>
    api.post("/leads/bulk-update", { leadIds, ...patch }),

  duplicateCheck: (params: { phone?: string; email?: string; gstNumber?: string }) =>
    api.get<LeadListItem[]>("/leads/duplicate-check", { params }).then((r) => r.data),

  merge: (id: number, duplicateLeadId: number) => api.post(`/leads/${id}/merge`, { duplicateLeadId }),

  timeline: (id: number, paging: { pageNumber?: number; pageSize?: number }) =>
    api.get<PagedResult<LeadTimelineEntry>>(`/leads/${id}/timeline`, { params: paging }).then((r) => r.data),
}
