// =========================
// Shared Types
// =========================

export interface Feature {
  icon: string;
  text: string;
}

export interface NearbyPlace {
  name: string;
  distance: string;
}

// =========================
// Image Upload Types
// =========================

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isMain: boolean;
}

// =========================
// Hotel Detail Types
// =========================

export interface HotelDetail {
  description: string;
  facilities: string[];
  images: string[];
  isPromoted?: boolean; // true if hotel is promoted
  location: string;
  name: string;
  nearby: NearbyPlace[]; // nearby places
  price: number;
  promoText?: string;
  rating: number;
  rooms: Room[];
}

// =========================
// Room Types
// =========================

export interface Room {
  id: string;
  features: Feature[]; // room features with icon
  images: string[];
  name: string;
  options: RoomOption[];
}

export interface RoomOption {
  includes?: string; // included amenities or services
  label: string; // option label (e.g., 'Deluxe', 'Suite')
  originalPrice?: number; // price before discount
  price: number; // current price
}

// =========================
// Gallery Props
// =========================

export interface HotelGalleryProps {
  images?: string[];
  maxDisplay?: number; // max images to display
}

// =========================
// Info Props
// =========================

export interface HotelInfoProps {
  description: string;
  facilities: string[];
  isPromoted?: boolean;
  location: string;
  name: string;
  nearby: NearbyPlace[];
  price: number;
  promoText?: string;
  rating: number;
}

// =========================
// Room Card Props
// =========================

export interface RoomCardProps {
  features: Feature[];
  images: string[];
  name: string;
  options: RoomOption[];
}
