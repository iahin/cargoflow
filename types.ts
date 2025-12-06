export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER'
}

export enum OfficeLocation {
  SG = 'Singapore',
  MY = 'Malaysia',
  BD = 'Bangladesh'
}

export enum ParcelCategory {
  MIXED = 'Mixed Items (Clothes/Shoes)',
  ELECTRICAL = 'Electrical/Hardware',
  MOBILE = 'Mobile Phone (<$300)',
  SMALL_1KG = 'Small Parcel (1kg)',
  SMALL_5KG = 'Small Parcel (5kg)',
  LED_TV = 'LED TV',
  LAPTOP = 'Used Laptop',
  OTHER = 'Other'
}

export enum ShipmentStatus {
  CREATED = 'Created',
  RECEIVED = 'Received at Office',
  IN_TRANSIT = 'In Transit',
  ARRIVED_BD = 'Arrived in BD',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  ON_HOLD = 'On Hold'
}

export interface Parcel {
  id: string;
  description: string;
  category: ParcelCategory;
  quantity: number;
  actualWeight: number; // kg
  length: number; // cm
  width: number; // cm
  height: number; // cm
  volumetricWeight: number; // kg
  chargeableWeight: number; // kg
  unitPrice: number;
  totalPrice: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  district?: string; // For receiver in BD
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  sender: Customer;
  receiver: Customer;
  originOffice: OfficeLocation;
  destinationCountry: string;
  status: ShipmentStatus;
  dateCreated: string;
  parcels: Parcel[];
  subtotal: number;
  tax: number;
  total: number;
  deliveryType: 'Office Pickup' | 'Home Delivery';
  notes?: string;
}

export interface DashboardStats {
  todayOrders: number;
  inTransit: number;
  delivered: number;
  revenueToday: number;
}