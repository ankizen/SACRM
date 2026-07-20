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
