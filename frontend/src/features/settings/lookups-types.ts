export interface LeadSource {
  id: number
  name: string
  isActive: boolean
  sortOrder: number
}

export interface LeadStage {
  id: number
  name: string
  isActive: boolean
  sortOrder: number
  isWonStage: boolean
  isLostStage: boolean
}

export interface Country {
  id: number
  name: string
  isActive: boolean
}

export interface City {
  id: number
  name: string
  isActive: boolean
  countryId: number
  countryName: string
}

export interface LeadSourceUpsertRequest {
  name: string
  isActive: boolean
  sortOrder: number
}

export interface LeadStageUpsertRequest {
  name: string
  isActive: boolean
  sortOrder: number
  isWonStage: boolean
  isLostStage: boolean
}

export interface CountryUpsertRequest {
  name: string
  isActive: boolean
}

export interface CityUpsertRequest {
  name: string
  isActive: boolean
  countryId: number
}
