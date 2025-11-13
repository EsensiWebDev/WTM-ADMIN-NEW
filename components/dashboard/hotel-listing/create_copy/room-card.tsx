import {
  RoomCardProps,
  RoomOption,
} from "@/app/(dashboard)/hotel-listing/create/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bed,
  ChevronRight,
  Cigarette,
  CigaretteOff,
  Square,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function RoomCard({ name, images, options, features }: RoomCardProps) {
  return (
    <Card className="grid grid-cols-1 rounded px-4 py-6 lg:grid-cols-10 lg:px-6">
      <h2 className="col-span-full mb-4 text-xl font-bold lg:mb-0">{name}</h2>
      <RoomImageGallery images={images} />
      <div className="col-span-full mt-6 flex flex-col lg:col-span-6 lg:mt-0">
        <div className="flex h-full flex-col space-y-2">
          <RoomOptions options={options} />
          <RoomFeatures features={features} />
          <div className="mt-2">
            <Link
              href="#"
              className="inline-flex items-center text-xs text-blue-600 hover:underline"
            >
              See Room Details & Benefits
              <ChevronRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RoomImageGallery({ images }: { images: string[] }) {
  return (
    <div className="col-span-full grid grid-cols-3 gap-4 lg:col-span-4">
      <div className="group relative col-span-3 aspect-[16/9] overflow-hidden rounded">
        <Image
          alt="Room main image"
          src={images[0]}
          className="absolute size-full object-cover group-hover:opacity-75"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      {images.slice(1, 4).map((image, index) => (
        <div
          key={index}
          className="group relative col-span-1 aspect-square overflow-hidden rounded"
        >
          <Image
            alt={`Room image ${index + 2}`}
            src={image}
            className="absolute size-full object-cover group-hover:opacity-75"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}

function RoomOptions({ options }: { options: RoomOption[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">Room Options</h3>
      {options.map((option, index) => (
        <div
          key={index}
          className={`${
            index === 0 ? "mt-2" : ""
          } flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center`}
        >
          <div
            className={`flex w-full flex-1 items-start justify-between ${
              index < options.length - 1 ? "border-b border-gray-600" : ""
            } py-4 sm:items-center`}
          >
            <div>
              <h4 className="font-medium">{option.label}</h4>
              {option.includes && (
                <p className="text-sm text-gray-500">{option.includes}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                {option.originalPrice ? (
                  <>
                    <p className="text-xs text-gray-500 line-through">
                      Rp {option.originalPrice.toLocaleString("id-ID")}
                    </p>
                    <p className="text-lg font-bold">
                      Rp {option.price.toLocaleString("id-ID")}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold">
                    Rp {option.price.toLocaleString("id-ID")}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button className="w-full sm:w-auto">Select</Button>
        </div>
      ))}
    </div>
  );
}

function RoomFeatures({
  features,
}: {
  features: {
    icon: string;
    text: string;
  }[];
}) {
  const getIcon = (iconName: string) => {
    const icons = {
      Square: <Square className="h-5 w-5" />,
      Users: <Users className="h-5 w-5" />,
      Cigarette: <Cigarette className="h-5 w-5" />,
      CigaretteOff: <CigaretteOff className="h-5 w-5" />,
      Bed: <Bed className="h-5 w-5" />,
    };
    return icons[iconName as keyof typeof icons] || null;
  };

  return (
    <div className="mt-auto pt-10 lg:pt-4">
      <div className="mb-4 flex flex-wrap gap-4 md:gap-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            {getIcon(feature.icon)}
            <span className="text-sm">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
