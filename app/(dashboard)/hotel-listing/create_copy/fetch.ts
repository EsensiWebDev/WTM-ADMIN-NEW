import { HotelDetail } from "./types";

const hotelImages = [
  "/hotel-detail/WTM Prototype.png",
  "/hotel-detail/WTM Prototype (1).png",
  "/hotel-detail/WTM Prototype (2).png",
  "/hotel-detail/WTM Prototype (3).png",
  "/hotel-detail/WTM Prototype (4).png",
  "/hotel-detail/WTM Prototype (4).png",
  "/hotel-detail/WTM Prototype (4).png",
];

const mockHotel: HotelDetail = {
  name: "Ibis Hotel & Convention",
  location: "Kuta, Badung - Bali",
  rating: 5,
  description:
    "Lorem ipsum dolor sit amet consectetur. Diam lectus massa velit aliquet pretium suspendisse pharetra et. Etiam pretium eu dictum rutrum turpis egestas eget euismod vulputate. Aenean massa pellentesque facilisi laoreet eu dui in rhoncus eu.",
  facilities: [
    "Lorem ipsum dolor sit amet consectetur...",
    "Diam lectus massa velit aliquet pretium suspendisse pharetra et.",
    "Etiam pretium eu dictum rutrum turpis egestas eget euismod vulputate.",
    "Risus eget mattis eu in cras et convallis.",
    "Facilisi laoreet eu in rhoncus eu.",
    "Aenean massa pellentesque facilisi laoreet eu dui in rhoncus eu.",
  ],
  nearby: [
    { name: "Ngurah Rai International Airport", distance: "3.2 km" },
    { name: "Kuta Beach", distance: "1.5 km" },
    { name: "Discovery Shopping Mall", distance: "2.0 km" },
    { name: "Waterbom Bali", distance: "2.3 km" },
    { name: "Beachwalk Shopping Center", distance: "2.8 km" },
    { name: "Bali Galeria Mall", distance: "4.1 km" },
  ],
  images: hotelImages,
  rooms: [
    {
      id: "room-1",
      name: "Business King Suite",
      images: hotelImages.slice(0, 4),
      options: [
        {
          label: "Without Breakfast",
          price: 2800000,
          originalPrice: 3100000,
        },
        {
          label: "With Breakfast",
          price: 2800000,
          originalPrice: 3100000,
          includes: "for 2 pax",
        },
      ],
      features: [
        { icon: "Square", text: "40 sqm" },
        { icon: "Users", text: "2 guests" },
        { icon: "CigaretteOff", text: "Non Smoking" },
        { icon: "Bed", text: "King Size" },
      ],
    },
    {
      id: "room-2",
      name: "Business King Suite Smoking",
      images: hotelImages.slice(1, 5),
      options: [
        {
          label: "Without Breakfast",
          price: 2700000,
          originalPrice: 3000000,
        },
        {
          label: "With Breakfast",
          price: 2750000,
          originalPrice: 3050000,
          includes: "for 2 pax",
        },
      ],
      features: [
        { icon: "Square", text: "40 sqm" },
        { icon: "Users", text: "2 guests" },
        { icon: "Cigarette", text: "Smoking" },
        { icon: "Bed", text: "King Size" },
      ],
    },
    {
      id: "room-3",
      name: "Presidental Suite",
      images: hotelImages.slice(2, 7),
      options: [
        {
          label: "Without Breakfast",
          price: 5000000,
          originalPrice: 6000000,
        },
        {
          label: "With Breakfast",
          price: 5200000,
          originalPrice: 6200000,
          includes: "for 4 pax",
        },
      ],
      features: [
        { icon: "Square", text: "120 sqm" },
        { icon: "Users", text: "4 guests" },
        { icon: "CigaretteOff", text: "Non Smoking" },
        { icon: "Bed", text: "2 King Size" },
        { icon: "Bath", text: "Private Jacuzzi" },
      ],
    },
  ],
};

export async function fetchHotelDetail(): Promise<HotelDetail> {
  return mockHotel;
}
