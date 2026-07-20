import { api } from "@/lib/api"
import type { CompanyProfile, CompanyProfileUpsertRequest } from "./company-profile-types"

export const companyProfileApi = {
  get: () => api.get<CompanyProfile | null>("/company-profile").then((r) => r.data),
  save: (values: CompanyProfileUpsertRequest) =>
    api.put<CompanyProfile>("/company-profile", values).then((r) => r.data),
}
