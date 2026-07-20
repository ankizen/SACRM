export interface CompanyProfile {
  id: number
  name: string
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  gstNumber: string | null
  logoUrl: string | null
  timezone: string
  updatedAtUtc: string | null
}

export interface CompanyProfileUpsertRequest {
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  gstNumber?: string
  logoUrl?: string
  timezone: string
}
