import { Shipment, ShipmentStatus, OfficeLocation, ParcelCategory } from '../types';

// Initial Mock Data
let shipments: Shipment[] = [
  {
    id: 'SH-1001',
    trackingNumber: 'TRK-2025-001',
    sender: { name: 'John Doe', phone: '+65 9123 4567', address: 'Block 123, Tampines St 11' },
    receiver: { name: 'Rahim Ahmed', phone: '+880 1711 223344', address: 'Village Road 5', district: 'Dhaka' },
    originOffice: OfficeLocation.SG,
    destinationCountry: 'Bangladesh',
    status: ShipmentStatus.IN_TRANSIT,
    dateCreated: new Date().toISOString(),
    deliveryType: 'Home Delivery',
    subtotal: 120,
    tax: 0,
    total: 120,
    parcels: [
      {
        id: 'p1',
        description: 'Clothes',
        category: ParcelCategory.MIXED,
        quantity: 1,
        actualWeight: 12,
        length: 40,
        width: 30,
        height: 30,
        volumetricWeight: 6,
        chargeableWeight: 12,
        unitPrice: 120,
        totalPrice: 120
      }
    ]
  },
  {
    id: 'SH-1002',
    trackingNumber: 'TRK-2025-002',
    sender: { name: 'Jane Lim', phone: '+65 9876 5432', address: 'Orchard Rd 1' },
    receiver: { name: 'Karim Ullah', phone: '+880 1922 334455', address: 'Chittagong Port Area', district: 'Chittagong' },
    originOffice: OfficeLocation.SG,
    destinationCountry: 'Bangladesh',
    status: ShipmentStatus.CREATED,
    dateCreated: new Date().toISOString(),
    deliveryType: 'Office Pickup',
    subtotal: 50,
    tax: 0,
    total: 50,
    parcels: [
      {
        id: 'p2',
        description: 'Samsung Phone',
        category: ParcelCategory.MOBILE,
        quantity: 1,
        actualWeight: 0.5,
        length: 15,
        width: 8,
        height: 5,
        volumetricWeight: 0.1,
        chargeableWeight: 0.5,
        unitPrice: 50,
        totalPrice: 50
      }
    ]
  }
];

export const getShipments = async (): Promise<Shipment[]> => {
  // Simulate network delay
  return new Promise((resolve) => setTimeout(() => resolve([...shipments]), 300));
};

export const getShipmentByTracking = async (tracking: string): Promise<Shipment | undefined> => {
  return new Promise((resolve) => setTimeout(() => resolve(shipments.find(s => s.trackingNumber === tracking)), 300));
};

export const createShipment = async (shipment: Shipment): Promise<Shipment> => {
  shipments = [shipment, ...shipments];
  return Promise.resolve(shipment);
};

export const updateShipmentStatus = async (id: string, status: ShipmentStatus): Promise<void> => {
  shipments = shipments.map(s => s.id === id ? { ...s, status } : s);
  return Promise.resolve();
};

export const generateTrackingNumber = (): string => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TRK-2025-${num}`;
};
