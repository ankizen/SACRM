import { api } from "@/lib/api"
import type {
  Country,
  CountryUpsertRequest,
  LeadSource,
  LeadSourceUpsertRequest,
  LeadStage,
  LeadStageUpsertRequest,
} from "./lookups-types"

export const lookupsApi = {
  leadSources: (includeInactive = false) =>
    api.get<LeadSource[]>("/lead-sources", { params: { includeInactive } }).then((r) => r.data),
  createLeadSource: (values: LeadSourceUpsertRequest) =>
    api.post<LeadSource>("/lead-sources", values).then((r) => r.data),
  updateLeadSource: (id: number, values: LeadSourceUpsertRequest) =>
    api.put(`/lead-sources/${id}`, values).then(() => undefined),

  leadStages: (includeInactive = false) =>
    api.get<LeadStage[]>("/lead-stages", { params: { includeInactive } }).then((r) => r.data),
  createLeadStage: (values: LeadStageUpsertRequest) => api.post<LeadStage>("/lead-stages", values).then((r) => r.data),
  updateLeadStage: (id: number, values: LeadStageUpsertRequest) =>
    api.put(`/lead-stages/${id}`, values).then(() => undefined),

  countries: (includeInactive = false) =>
    api.get<Country[]>("/countries", { params: { includeInactive } }).then((r) => r.data),
  createCountry: (values: CountryUpsertRequest) => api.post<Country>("/countries", values).then((r) => r.data),
  updateCountry: (id: number, values: CountryUpsertRequest) =>
    api.put(`/countries/${id}`, values).then(() => undefined),
}
