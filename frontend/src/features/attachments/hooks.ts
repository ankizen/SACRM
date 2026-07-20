import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { attachmentsApi } from "./attachments-api"
import type { AttachmentCategory } from "./types"

export function useAttachments(leadId: number) {
  return useQuery({
    queryKey: ["leads", leadId, "attachments"],
    queryFn: () => attachmentsApi.list(leadId),
    enabled: Number.isFinite(leadId),
  })
}

export function useUploadAttachment(leadId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, category }: { file: File; category: AttachmentCategory }) =>
      attachmentsApi.upload(leadId, file, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "attachments"] })
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "timeline"] })
    },
  })
}

export function useDeleteAttachment(leadId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: number) => attachmentsApi.remove(leadId, attachmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads", leadId, "attachments"] }),
  })
}
