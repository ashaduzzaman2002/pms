import { Property } from "@/components/PropertyCard";
import villaHero from "@/assets/villa-hero.jpg";
import hotelSample from "@/assets/hotel-sample.jpg";
import flatSample from "@/assets/flat-sample.jpg";

export const mockProperties: Property[] = [
  {
    id: "1",
    name: "Luxury Mediterranean Villa",
    type: "villa",
    location: "Santorini, Greece",
    address: "123 Sunset Boulevard, Oia, Santorini",
    description: "A stunning villa with panoramic ocean views, infinity pool, and premium amenities. Perfect for luxury getaways and special occasions.",
    amenities: ["Pool", "Ocean View", "WiFi", "Kitchen", "Parking", "Garden"],
    pricePerNight: 450,
    images: [villaHero],
    availabilityStatus: "available",
    owner: {
      name: "Maria Papadopoulos",
      email: "maria@example.com"
    }
  },
  {
    id: "2",
    name: "Grand Metropolitan Hotel",
    type: "hotel",
    location: "New York, USA",
    address: "456 5th Avenue, Manhattan, NY",
    description: "Elegant hotel in the heart of Manhattan with world-class service, fine dining, and luxury accommodations.",
    amenities: ["Concierge", "Restaurant", "Gym", "WiFi", "Business Center"],
    pricePerNight: 320,
    images: [hotelSample],
    availabilityStatus: "booked",
    owner: {
      name: "John Smith",
      email: "john@grandmetro.com"
    }
  },
  {
    id: "3",
    name: "Modern City Apartment",
    type: "flat",
    location: "London, UK",
    address: "789 Thames Street, London Bridge",
    description: "Contemporary apartment with city views, modern furnishings, and excellent transport links to central London.",
    amenities: ["City View", "WiFi", "Kitchen", "Balcony", "Washer"],
    pricePerNight: 180,
    images: [flatSample],
    availabilityStatus: "available",
    owner: {
      name: "Emma Wilson",
      email: "emma@example.com"
    }
  },
  {
    id: "4",
    name: "Seaside Villa Retreat",
    type: "villa",
    location: "Malibu, USA",
    address: "321 Pacific Coast Highway, Malibu, CA",
    description: "Beachfront villa with direct beach access, modern amenities, and breathtaking sunset views.",
    amenities: ["Beach Access", "Pool", "WiFi", "Kitchen", "Parking", "Hot Tub"],
    pricePerNight: 650,
    images: [villaHero],
    availabilityStatus: "maintenance",
    owner: {
      name: "Robert Johnson",
      email: "robert@seasidevilla.com"
    }
  },
  {
    id: "5",
    name: "Downtown Studio Loft",
    type: "flat",
    location: "Toronto, Canada",
    address: "654 King Street West, Toronto, ON",
    description: "Stylish studio loft in vibrant downtown area, perfect for business travelers and urban explorers.",
    amenities: ["WiFi", "Kitchen", "Gym Access", "Parking", "Balcony"],
    pricePerNight: 120,
    images: [flatSample],
    availabilityStatus: "available",
    owner: {
      name: "Sarah Chen",
      email: "sarah@example.com"
    }
  },
  {
    id: "6",
    name: "Boutique Mountain Hotel",
    type: "hotel",
    location: "Aspen, USA",
    address: "987 Mountain View Drive, Aspen, CO",
    description: "Charming boutique hotel nestled in the mountains, offering ski-in/ski-out access and alpine luxury.",
    amenities: ["Ski Access", "Restaurant", "Spa", "WiFi", "Fireplace"],
    pricePerNight: 420,
    images: [hotelSample],
    availabilityStatus: "available",
    owner: {
      name: "Michael Brown",
      email: "michael@mountainhotel.com"
    }
  }
];

export interface BookingData {
  id: string;
  propertyId: string;
  propertyName: string;
  tenantName: string;
  tenantEmail: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "overdue";
  bookingStatus: "confirmed" | "cancelled" | "completed";
}

export const mockBookings: BookingData[] = [
  {
    id: "b1",
    propertyId: "1",
    propertyName: "Luxury Mediterranean Villa",
    tenantName: "Alice Cooper",
    tenantEmail: "alice@example.com",
    checkIn: "2024-01-15",
    checkOut: "2024-01-20",
    totalAmount: 2250,
    paymentStatus: "paid",
    bookingStatus: "confirmed"
  },
  {
    id: "b2",
    propertyId: "2",
    propertyName: "Grand Metropolitan Hotel",
    tenantName: "Bob Wilson",
    tenantEmail: "bob@example.com",
    checkIn: "2024-01-10",
    checkOut: "2024-01-14",
    totalAmount: 1280,
    paymentStatus: "pending",
    bookingStatus: "confirmed"
  },
  {
    id: "b3",
    propertyId: "3",
    propertyName: "Modern City Apartment",
    tenantName: "Carol Davis",
    tenantEmail: "carol@example.com",
    checkIn: "2024-01-08",
    checkOut: "2024-01-12",
    totalAmount: 720,
    paymentStatus: "paid",
    bookingStatus: "completed"
  }
];