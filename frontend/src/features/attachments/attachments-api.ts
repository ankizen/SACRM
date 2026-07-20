import { api } from "@/lib/api"
import type { Attachment, AttachmentCategory } from "./types"

export const attachmentsApi = {
  list: (leadId: number) => api.get<Attachment[]>(`/leads/${leadId}/attachments`).then((r) => r.data),

  upload: (leadId: number, file: File, category: AttachmentCategory) => {
    const formData = new FormData()
    formData.append("File", file)
    formData.append("Category", category)
    return api
      .post<Attachment>(`/leads/${leadId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data)
  },

  download: (leadId: number, attachmentId: number) =>
    api.get(`/leads/${leadId}/attachments/${attachmentId}/download`, { responseType: "blob" }),

  remove: (leadId: number, attachmentId: number) => api.delete(`/leads/${leadId}/attachments/${attachmentId}`),
}
