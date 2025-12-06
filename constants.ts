import { ParcelCategory } from './types';

// Pricing configuration
export const PRICING_RULES = {
  [ParcelCategory.MIXED]: { pricePerKg: 10, minWeight: 10, isFixed: false },
  [ParcelCategory.ELECTRICAL]: { pricePerKg: 15, minWeight: 1, isFixed: false },
  [ParcelCategory.LED_TV]: { pricePerKg: 30, minWeight: 1, isFixed: false, tax: 0.08 }, // Example tax logic
  [ParcelCategory.MOBILE]: { fixedPrice: 50, isFixed: true, tax: 0 },
  [ParcelCategory.SMALL_1KG]: { fixedPrice: 50, isFixed: true },
  [ParcelCategory.SMALL_5KG]: { fixedPrice: 80, isFixed: true },
  [ParcelCategory.LAPTOP]: { fixedPrice: 80, isFixed: true },
  [ParcelCategory.OTHER]: { pricePerKg: 12, minWeight: 1, isFixed: false },
};

export const VOLUMETRIC_DIVISOR = 6000; // Standard air cargo divisor

export const PROHIBITED_ITEMS = [
  "Batteries (Lithium)",
  "Explosives / Fireworks",
  "Flammable Liquids (Perfume > 100ml)",
  "Corrosives / Acids",
  "Illegal Drugs / Narcotics",
  "Currency / Cash",
  "Precious Metals / Jewelry"
];

export const OFFICES = [
  { id: 'SG', name: 'Singapore HQ', address: '101 Cargo Road, Singapore 500000', phone: '+65 6000 0000' },
  { id: 'MY', name: 'Malaysia Branch', address: '55 KL Sentral, Kuala Lumpur', phone: '+60 3 0000 0000' },
  { id: 'BD', name: 'Dhaka Hub', address: 'House 12, Road 5, Dhaka', phone: '+880 17 0000 0000' }
];
