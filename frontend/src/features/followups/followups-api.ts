import { api } from "@/lib/api"
import type { PagedResult } from "@/lib/types"
import type { Followup, FollowupCreateRequest, FollowupUpdateRequest } from "./types"

export const followupsApi = {
  list: (leadId: number) =>
    api.get<PagedResult<Followup>>(`/leads/${leadId}/followups`, { params: { pageSize: 50 } }).then((r) => r.data),

  create: (leadId: number, values: FollowupCreateRequest) =>
    api.post<Followup>(`/leads/${leadId}/followups`, values).then((r) => r.data),

  update: (id: number, values: FollowupUpdateRequest) => api.put(`/followups/${id}`, values),

  today: () => api.get<Followup[]>("/followups/today").then((r) => r.data),

  pending: () => api.get<Followup[]>("/followups/pending").then((r) => r.data),
}
