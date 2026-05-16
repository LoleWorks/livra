
export type VehicleType = 'economy' | 'small_van' | 'large_van' | 'truck_5t' | 'truck_20t';

export interface PricingOptions {
  vehicleType: VehicleType;
  moversCount: number;
  distanceKm: number;
  durationHrs: number;
  isOutsideChisinau: boolean;
  suburbTier?: 1 | 2; // 1: Bacioi, Stauceni... 2: Ialoveni, Singera...
  floors?: number;
  hasLift?: boolean;
}

export const PRICING_CONSTANTS = {
  // Transport in Chișinău (MDL/hr)
  TRANSPORT_CITY: {
    economy: 150, // Added a base economy tier for small items
    small_van: 350, // 1.5t
    large_van: 400, // 2.5t
    truck_5t: 600, // 5t (Min 2h)
  },
  
  // Transport outside Chișinău
  TRANSPORT_OUTSIDE: {
    suburb_tier1: 430, // 1.5t
    suburb_tier2: 450, // 1.5t
    per_km: {
      small_van: { short: 14, long: 12 }, // 25-50km, >50km
      large_van: { short: 16, long: 13 },
      truck_5t: { short: 18, long: 16 },
    }
  },

  // Movers (MDL/pers/hr)
  MOVERS: {
    standard: 250,
    heavy: 300, // > 200kg or machines
  },

  // Construction materials (MDL/unit/floor)
  CONSTRUCTION_UNIT: {
    light: 7, // < 30kg
    medium: 8, // < 40kg
    heavy: 60, // Bulky/Large
  }
};

export function calculateEstimation(options: PricingOptions): number {
  let total = 0;
  const { vehicleType, moversCount, distanceKm, durationHrs, isOutsideChisinau, suburbTier } = options;

  // 1. Vehicle Cost
  if (isOutsideChisinau) {
    if (suburbTier === 1) {
      total += Math.max(1, durationHrs) * PRICING_CONSTANTS.TRANSPORT_OUTSIDE.suburb_tier1;
    } else if (suburbTier === 2) {
      total += Math.max(1, durationHrs) * PRICING_CONSTANTS.TRANSPORT_OUTSIDE.suburb_tier2;
    } else {
      // Long distance per km (round trip)
      const rates = PRICING_CONSTANTS.TRANSPORT_OUTSIDE.per_km[vehicleType as keyof typeof PRICING_CONSTANTS.TRANSPORT_OUTSIDE.per_km] || PRICING_CONSTANTS.TRANSPORT_OUTSIDE.per_km.small_van;
      const rate = distanceKm > 50 ? rates.long : rates.short;
      total += distanceKm * 2 * rate; // tur-retur
      
      // Hourly standby for long distance
      const standbyRate = PRICING_CONSTANTS.TRANSPORT_CITY[vehicleType as keyof typeof PRICING_CONSTANTS.TRANSPORT_CITY] || 350;
      total += durationHrs * standbyRate;
    }
  } else {
    // In City
    const rate = PRICING_CONSTANTS.TRANSPORT_CITY[vehicleType as keyof typeof PRICING_CONSTANTS.TRANSPORT_CITY] || PRICING_CONSTANTS.TRANSPORT_CITY.economy;
    const minHrs = vehicleType === 'truck_5t' ? 2 : 1;
    total += Math.max(minHrs, durationHrs) * rate;
  }

  // 2. Movers Cost
  if (moversCount > 0) {
    total += moversCount * durationHrs * PRICING_CONSTANTS.MOVERS.standard;
  }

  return total;
}

export function recommendVehicle(itemWeightKg: number, itemVolumeM3: number): VehicleType {
  if (itemWeightKg < 10 && itemVolumeM3 < 0.1) return 'economy';
  if (itemWeightKg < 1500 && itemVolumeM3 < 14) return 'small_van';
  if (itemWeightKg < 2500 && itemVolumeM3 < 20) return 'large_van';
  return 'truck_5t';
}
