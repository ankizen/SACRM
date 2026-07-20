import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { lookupsApi } from "./lookups-api"
import type { CountryUpsertRequest, LeadSourceUpsertRequest, LeadStageUpsertRequest } from "./lookups-types"

// Dropdowns (Lead form/filters) default to active-only; the Settings management
// screens pass includeInactive=true so admins can see and reactivate retired entries.

export function useLeadSources(includeInactive = false) {
  return useQuery({
    queryKey: ["lead-sources", includeInactive],
    queryFn: () => lookupsApi.leadSources(includeInactive),
  })
}

export function useLeadStages(includeInactive = false) {
  return useQuery({
    queryKey: ["lead-stages", includeInactive],
    queryFn: () => lookupsApi.leadStages(includeInactive),
  })
}

export function useCountries(includeInactive = false) {
  return useQuery({
    queryKey: ["countries", includeInactive],
    queryFn: () => lookupsApi.countries(includeInactive),
  })
}

export function useSaveLeadSource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: LeadSourceUpsertRequest }) =>
      id ? lookupsApi.updateLeadSource(id, values) : lookupsApi.createLeadSource(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lead-sources"] }),
  })
}

export function useSaveLeadStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: LeadStageUpsertRequest }) =>
      id ? lookupsApi.updateLeadStage(id, values) : lookupsApi.createLeadStage(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lead-stages"] }),
  })
}

export function useSaveCountry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: CountryUpsertRequest }) =>
      id ? lookupsApi.updateCountry(id, values) : lookupsApi.createCountry(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["countries"] }),
  })
}
