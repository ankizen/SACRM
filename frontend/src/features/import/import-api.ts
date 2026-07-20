import { api } from "@/lib/api"
import type { LeadImportPreview, LeadImportResult } from "./types"

export const importApi = {
  preview: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api
      .post<LeadImportPreview>("/leads/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data)
  },

  import: (file: File, mapping: Record<string, string>) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("mapping", JSON.stringify(mapping))
    return api
      .post<LeadImportResult>("/leads/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data)
  },
}
