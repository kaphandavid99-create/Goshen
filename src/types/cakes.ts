export type CakeCategory = string;

export type CakeItem = {
  id: string;
  name: string;
  description: string;
  category: CakeCategory;
  priceCents: number | null;
  priceNote: string | null;
  imageUrl: string;
  cloudinaryPublicId?: string | null;
  featured: boolean;
  available: boolean;
  sortOrder: number;
};

export type CakeBookingStatus =
  | "NEW"
  | "CONTACTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";
