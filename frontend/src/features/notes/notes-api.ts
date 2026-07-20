import { api } from "@/lib/api"
import type { PagedResult } from "@/lib/types"
import type { Note } from "./types"

export const notesApi = {
  list: (leadId: number) =>
    api.get<PagedResult<Note>>(`/leads/${leadId}/notes`, { params: { pageSize: 100 } }).then((r) => r.data),

  create: (leadId: number, content: string) =>
    api.post<Note>(`/leads/${leadId}/notes`, { content }).then((r) => r.data),

  update: (id: number, content: string) => api.put(`/notes/${id}`, { content }),

  remove: (id: number) => api.delete(`/notes/${id}`),
}
