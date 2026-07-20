import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { companyProfileApi } from "./company-profile-api"
import type { CompanyProfileUpsertRequest } from "./company-profile-types"

export function useCompanyProfile() {
  return useQuery({ queryKey: ["company-profile"], queryFn: companyProfileApi.get })
}

export function useSaveCompanyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CompanyProfileUpsertRequest) => companyProfileApi.save(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-profile"] }),
  })
}
