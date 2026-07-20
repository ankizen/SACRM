import { api } from "@/lib/api"
import type { City, Country, LeadSource, LeadStage } from "./lookups-types"

export const lookupsApi = {
  leadSources: (includeInactive = false) =>
    api.get<LeadSource[]>("/lead-sources", { params: { includeInactive } }).then((r) => r.data),

  leadStages: (includeInactive = false) =>
    api.get<LeadStage[]>("/lead-stages", { params: { includeInactive } }).then((r) => r.data),

  countries: (includeInactive = false) =>
    api.get<Country[]>("/countries", { params: { includeInactive } }).then((r) => r.data),

  cities: (countryId?: number, includeInactive = false) =>
    api.get<City[]>("/cities", { params: { countryId, includeInactive } }).then((r) => r.data),
}
