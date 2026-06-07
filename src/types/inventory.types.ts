/**
 * Inventory Type Definitions
 */

export enum TentType {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  FAMILY = 'family',
  LUXURY = 'luxury',
}

export enum TentStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

export interface Tent {
  id: string;
  name: string;
  type: TentType;
  capacity: number;
  pricePerNight: number;
  status: TentStatus;
  description?: string;
  amenities: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTentInput {
  name: string;
  type: TentType;
  capacity: number;
  pricePerNight: number;
  description?: string;
  amenities: string[];
  images: string[];
}

// Made with Bob
