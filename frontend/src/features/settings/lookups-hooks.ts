import { useQuery } from "@tanstack/react-query"
import { lookupsApi } from "./lookups-api"

export function useLeadSources() {
  return useQuery({ queryKey: ["lead-sources"], queryFn: () => lookupsApi.leadSources() })
}

export function useLeadStages() {
  return useQuery({ queryKey: ["lead-stages"], queryFn: () => lookupsApi.leadStages() })
}

export function useCountries() {
  return useQuery({ queryKey: ["countries"], queryFn: () => lookupsApi.countries() })
}

export function useCities(countryId?: number) {
  return useQuery({
    queryKey: ["cities", countryId],
    queryFn: () => lookupsApi.cities(countryId),
  })
}
