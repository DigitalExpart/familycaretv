// Central plan limits configuration
// All resource caps are defined here so they can be referenced
// by guards, services, and frontend responses.

export const PLAN_LIMITS = {
  FREE_TRIAL: {
    patients: Infinity,
    kids: Infinity,
    pets: Infinity,
    medications: Infinity,
    appointments: Infinity,
    notes: Infinity,
    tasks: Infinity,
    rokuDevices: Infinity,
    aiLookupsPerDay: Infinity,
    familyMembers: 0,
  },
  PERSONAL: {
    patients: 2,
    kids: 3,
    pets: 2,
    medications: 3,
    appointments: 3,
    notes: 4,
    tasks: 3,
    rokuDevices: 1,
    aiLookupsPerDay: 3,
    familyMembers: 0,
  },
  FAMILY: {
    patients: Infinity,
    kids: Infinity,
    pets: Infinity,
    medications: Infinity,
    appointments: Infinity,
    notes: Infinity,
    tasks: Infinity,
    rokuDevices: 3,
    aiLookupsPerDay: Infinity,
    familyMembers: 3, // 3 invited family members
  },
} as const;

export type PlanTierKey = keyof typeof PLAN_LIMITS;
export type ResourceKey = keyof typeof PLAN_LIMITS.PERSONAL;

// Serializable version for API responses (replaces Infinity with -1)
export function getSerializableLimits(tier: PlanTierKey) {
  const limits = PLAN_LIMITS[tier];
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(limits)) {
    result[key] = value === Infinity ? -1 : value;
  }
  return result;
}
