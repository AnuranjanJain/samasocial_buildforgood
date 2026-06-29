export type WorkerSegment =
  | 'daily-wage'
  | 'first-time'
  | 'women-returning'
  | 'micro-entrepreneur'
  | 'farmer'

export type AvailabilityWindow = 'Morning' | 'Afternoon' | 'Evening' | 'Flexible'

export interface Worker {
  id: string
  name: string
  hindiName: string
  segment: WorkerSegment
  role: string
  location: string
  distancePreferenceKm: number
  languages: string[]
  skills: string[]
  verifiedSkills: string[]
  weeklyIncomeTarget: number
  earnedThisWeek: number
  pendingPayments: number
  completedShifts: number
  availability: AvailabilityWindow[]
  experience: string
  workPreference: string
  documents: string[]
  womenWorkMode?: {
    enabled: boolean
    preferredHours: string
    nearbyOnly: boolean
    childcareNote: string
  }
  farmProfile?: {
    crop: string
    season: string
    acreage: number
    expectedHarvestKg: number
  }
  enterpriseProfile?: {
    serviceName: string
    priceRange: string
    repeatCustomers: number
    monthlyGoal: number
  }
}

export interface Employer {
  id: string
  name: string
  type: string
  location: string
  reliabilityScore: number
  paymentClarity: number
  pastHires: number
  womenFriendly: boolean
}

export interface Job {
  id: string
  title: string
  employerId: string
  location: string
  distanceKm: number
  pay: number
  payUnit: 'shift' | 'day' | 'week' | 'order' | 'quintal'
  schedule: string
  openings: number
  requiredSkills: string[]
  goodFor: WorkerSegment[]
  clarity: string
}

export interface ServiceRequest {
  id: string
  title: string
  customer: string
  budget: number
  due: string
  requiredSkills: string[]
  status: 'New' | 'Quoted' | 'Repeat'
}

export interface FarmOpportunity {
  id: string
  title: string
  buyer: string
  cropOrSkill: string
  price: number
  unit: string
  window: string
  stabilityReason: string
}

export interface ImpactMetric {
  label: string
  value: string
  detail: string
}

export interface MatchResult {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  reasons: string[]
}
