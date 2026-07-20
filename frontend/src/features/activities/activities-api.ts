import { api } from "@/lib/api"
import type { PagedResult } from "@/lib/types"
import type { Activity, ActivityCreateRequest } from "./types"

export const activitiesApi = {
  list: (leadId: number, pageNumber = 1) =>
    api
      .get<PagedResult<Activity>>(`/leads/${leadId}/activities`, { params: { pageNumber, pageSize: 50 } })
      .then((r) => r.data),

  create: (leadId: number, values: ActivityCreateRequest) =>
    api.post<Activity>(`/leads/${leadId}/activities`, values).then((r) => r.data),
}
