import { HistoryBookingLog } from "@/app/(dashboard)/booking-management/history-booking-log/types";
import {
  ComprehensiveInvoiceData,
  InvoiceCompany,
  InvoiceCustomer,
  InvoiceData,
  InvoiceLineItem,
} from "@/types/invoice";

export class InvoiceGenerator {
  // Company information (from the image)
  private static readonly COMPANY_INFO: InvoiceCompany = {
    name: "PT. World Travel Marketing Bali",
    address:
      "Ikat Plaza Building - Jl. Bypass Ngurah Rai No. 505\nPemogan - Denpasar Selatan\n80221 Denpasar - Bali - Indonesia",
    phone: "0361 4756583",
    email: "info.wtmbali@gmail.com",
    website: "www.wtmbali.com",
  };

  // Sample hotel names for variety
  private static readonly HOTEL_NAMES = [
    "Grand Hyatt Jakarta",
    "The Ritz-Carlton Jakarta",
    "Hotel Indonesia Kempinski",
    "Fairmont Jakarta",
    "JW Marriott Hotel Jakarta",
    "The Sultan Hotel & Residence Jakarta",
    "Shangri-La Hotel Jakarta",
    "Four Points by Sheraton Jakarta",
    "DoubleTree by Hilton Jakarta",
    "Pullman Jakarta Indonesia",
  ];

  private static readonly ROOM_TYPES = [
    "Deluxe Room",
    "Executive Suite",
    "Presidential Suite",
    "Standard Room",
    "Superior Room",
    "Junior Suite",
    "Royal Suite",
    "Business Room",
    "Family Room",
    "Ocean View Room",
  ];

  private static readonly AMENITIES = [
    "Free WiFi",
    "Swimming Pool",
    "Fitness Center",
    "Spa Services",
    "Restaurant",
    "Room Service",
    "Business Center",
    "Conference Rooms",
    "Airport Shuttle",
    "Parking",
    "Laundry Service",
    "Concierge Service",
  ];

  /**
   * Map HistoryBookingLog booking status to invoice booking status
   */
  private static mapBookingStatus(
    status: "confirmed" | "rejected" | "in review"
  ): "approved" | "waiting" | "rejected" {
    switch (status) {
      case "confirmed":
        return "approved";
      case "in review":
        return "waiting";
      case "rejected":
        return "rejected";
      default:
        return "waiting";
    }
  }

  /**
   * Generate comprehensive invoice data from basic booking information
   */
  static generateFromBooking(
    booking: HistoryBookingLog
  ): ComprehensiveInvoiceData {
    const checkInDate = this.generateCheckInDate();
    const checkOutDate = this.generateCheckOutDate(checkInDate);
    const numberOfNights = this.calculateNights(checkInDate, checkOutDate);
    const numberOfGuests = this.generateGuestCount();

    // Generate financial data
    const basePrice = this.generateBasePrice();
    const subtotal = basePrice * numberOfNights;
    const taxRate = 0.11; // 11% VAT in Indonesia
    const taxes = subtotal * taxRate;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const discountRate = this.generateDiscountRate();
    const discount = subtotal * discountRate;
    const totalAmount = subtotal + taxes + serviceFee - discount;

    const hotelName = this.getRandomHotelName();
    const roomType = this.getRandomRoomType();

    return {
      // Basic booking information
      bookingId: booking.booking_id,
      guestName: booking.agent_name, // Using agent_name as guest name since guestName doesn't exist
      bookingDate: this.generateBookingDate(),
      checkInDate,
      checkOutDate,

      // Hotel information
      hotelName,
      hotelAddress: this.generateHotelAddress(hotelName),
      roomType,
      numberOfNights,
      numberOfGuests,

      // Financial details
      basePrice,
      taxes,
      serviceFee,
      discount,
      totalAmount,
      currency: "IDR",
      subtotal,
      taxRate,
      discountRate,

      // Status information
      bookingStatus: this.mapBookingStatus(booking.booking_status),
      paymentStatus: booking.payment_status,

      // Invoice metadata
      invoiceNumber: this.generateInvoiceNumber(),
      invoiceDate: new Date().toISOString(),
      dueDate: this.generateDueDate(),
      notes: this.generateNotes(), // booking doesn't have notes property

      // Additional hotel details
      hotelRating: this.generateHotelRating(),
      amenities: this.generateAmenities(),
      roomDescription: this.generateRoomDescription(roomType),
      cancellationPolicy: this.generateCancellationPolicy(),

      // Company and customer information
      company: this.COMPANY_INFO,
      customer: this.generateCustomerInfo(booking.agent_name),
      lineItems: this.generateLineItems(
        roomType,
        numberOfNights,
        basePrice,
        serviceFee
      ),

      // Payment information
      paymentMethod: this.generatePaymentMethod(),
      paymentDueDate:
        booking.payment_status === "unpaid"
          ? this.generateDueDate()
          : undefined,
      termsAndConditions: this.generateTermsAndConditions(),
    };
  }

  /**
   * Generate a simple invoice data structure
   */
  static generateSimpleInvoice(booking: HistoryBookingLog): InvoiceData {
    const comprehensive = this.generateFromBooking(booking);

    // Return simplified version
    return {
      bookingId: comprehensive.bookingId,
      guestName: comprehensive.guestName,
      bookingDate: comprehensive.bookingDate,
      checkInDate: comprehensive.checkInDate,
      checkOutDate: comprehensive.checkOutDate,
      hotelName: comprehensive.hotelName,
      hotelAddress: comprehensive.hotelAddress,
      roomType: comprehensive.roomType,
      numberOfNights: comprehensive.numberOfNights,
      numberOfGuests: comprehensive.numberOfGuests,
      basePrice: comprehensive.basePrice,
      taxes: comprehensive.taxes,
      serviceFee: comprehensive.serviceFee,
      discount: comprehensive.discount,
      totalAmount: comprehensive.totalAmount,
      currency: comprehensive.currency,
      bookingStatus: comprehensive.bookingStatus,
      paymentStatus: comprehensive.paymentStatus,
      invoiceNumber: comprehensive.invoiceNumber,
      invoiceDate: comprehensive.invoiceDate,
      dueDate: comprehensive.dueDate,
      notes: comprehensive.notes,
      hotelRating: comprehensive.hotelRating,
      amenities: comprehensive.amenities,
      roomDescription: comprehensive.roomDescription,
      cancellationPolicy: comprehensive.cancellationPolicy,
    };
  }

  // Private helper methods for generating mock data
  private static generateCheckInDate(): string {
    const today = new Date();
    const futureDate = new Date(
      today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
    );
    return futureDate.toISOString().split("T")[0];
  }

  private static generateCheckOutDate(checkInDate: string): string {
    const checkIn = new Date(checkInDate);
    const nights = Math.floor(Math.random() * 7) + 1; // 1-7 nights
    const checkOut = new Date(checkIn.getTime() + nights * 24 * 60 * 60 * 1000);
    return checkOut.toISOString().split("T")[0];
  }

  private static calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static generateGuestCount(): number {
    return Math.floor(Math.random() * 4) + 1; // 1-4 guests
  }

  private static generateBasePrice(): number {
    const prices = [
      500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 3000000,
    ];
    return prices[Math.floor(Math.random() * prices.length)];
  }

  private static generateDiscountRate(): number {
    const rates = [0, 0.05, 0.1, 0.15, 0.2];
    return rates[Math.floor(Math.random() * rates.length)];
  }

  private static generateBookingDate(): string {
    const today = new Date();
    const pastDate = new Date(
      today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
    );
    return pastDate.toISOString();
  }

  private static generateInvoiceNumber(): string {
    const prefix = "INV";
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${prefix}-${year}-${randomNum}`;
  }

  private static generateDueDate(): string {
    const today = new Date();
    const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    return dueDate.toISOString();
  }

  private static generateNotes(): string {
    const notes = [
      "Please ensure early check-in is confirmed 24 hours prior to arrival.",
      "Room upgrade subject to availability upon check-in.",
      "Breakfast is included for all guests.",
      "Late check-out may incur additional charges.",
      "Spa services can be booked directly with the hotel.",
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  private static generateHotelRating(): number {
    return Math.floor(Math.random() * 3) + 3; // 3-5 stars
  }

  private static generateAmenities(): string[] {
    const count = Math.floor(Math.random() * 6) + 4; // 4-9 amenities
    const shuffled = [...this.AMENITIES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private static generateRoomDescription(roomType: string): string {
    const descriptions = {
      "Deluxe Room":
        "Spacious room with city view, featuring modern amenities and comfortable bedding.",
      "Executive Suite":
        "Luxury suite with separate living area, premium amenities, and executive lounge access.",
      "Presidential Suite":
        "The finest accommodation featuring panoramic views, butler service, and exclusive amenities.",
      "Standard Room":
        "Comfortable room with essential amenities and quality furnishings.",
      "Superior Room":
        "Enhanced room with upgraded amenities and better views.",
    };
    return (
      descriptions[roomType as keyof typeof descriptions] ||
      "Comfortable accommodation with modern amenities."
    );
  }

  private static generateCancellationPolicy(): string {
    const policies = [
      "Free cancellation up to 24 hours before check-in.",
      "Free cancellation up to 48 hours before check-in.",
      "Non-refundable booking.",
      "Free cancellation up to 7 days before check-in.",
      "Flexible cancellation policy with partial refund.",
    ];
    return policies[Math.floor(Math.random() * policies.length)];
  }

  private static getRandomHotelName(): string {
    return this.HOTEL_NAMES[
      Math.floor(Math.random() * this.HOTEL_NAMES.length)
    ];
  }

  private static getRandomRoomType(): string {
    return this.ROOM_TYPES[Math.floor(Math.random() * this.ROOM_TYPES.length)];
  }

  private static generateHotelAddress(hotelName: string): string {
    const addresses = [
      "Jl. Thamrin No. 1, Jakarta Pusat, 10310",
      "Jl. Dr. Ide Anak Agung Gde Agung, Jakarta Selatan, 12950",
      "Jl. M.H. Thamrin No. 1, Jakarta Pusat, 10310",
      "Jl. Asia Afrika No. 8, Jakarta Pusat, 10270",
      "Jl. H.R. Rasuna Said, Jakarta Selatan, 12940",
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  private static generateCustomerInfo(guestName: string): InvoiceCustomer {
    return {
      name: guestName,
      email: `${guestName.toLowerCase().replace(/\s+/g, ".")}@email.com`,
      phone: `+62 ${Math.floor(Math.random() * 900000000) + 100000000}`,
      address: "Jakarta, Indonesia",
      companyName: "Company Name",
      agentName: "Agent Name",
    };
  }

  private static generateLineItems(
    roomType: string,
    nights: number,
    basePrice: number,
    serviceFee: number
  ): InvoiceLineItem[] {
    return [
      {
        description: `${roomType} - ${nights} night${nights > 1 ? "s" : ""}`,
        quantity: nights,
        unitPrice: basePrice,
        total: basePrice * nights,
      },
      {
        description: "Service Fee",
        quantity: 1,
        unitPrice: serviceFee,
        total: serviceFee,
      },
    ];
  }

  private static generatePaymentMethod(): string {
    const methods = ["Credit Card", "Bank Transfer", "Cash", "Digital Wallet"];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  private static generateTermsAndConditions(): string {
    return `1. Payment is due within 30 days of invoice date.
2. Late payments may incur additional charges.
3. Cancellation policies apply as per booking terms.
4. All prices are in Indonesian Rupiah (IDR).
5. Disputes must be reported within 7 days of service completion.`;
  }
}
