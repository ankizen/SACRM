import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notesApi } from "./notes-api"

export function useNotes(leadId: number) {
  return useQuery({
    queryKey: ["leads", leadId, "notes"],
    queryFn: () => notesApi.list(leadId),
    enabled: Number.isFinite(leadId),
  })
}

export function useCreateNote(leadId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => notesApi.create(leadId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "notes"] })
      queryClient.invalidateQueries({ queryKey: ["leads", leadId, "timeline"] })
    },
  })
}

export function useUpdateNote(leadId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => notesApi.update(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads", leadId, "notes"] }),
  })
}

export function useDeleteNote(leadId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads", leadId, "notes"] }),
  })
}
