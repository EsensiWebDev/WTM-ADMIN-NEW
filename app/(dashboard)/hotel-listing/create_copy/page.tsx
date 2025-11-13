import { HotelForm } from "@/components/dashboard/hotel-listing/form/hotel-form-copy";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const CreateHotelPage = () => {
  return (
    <div className="space-y-8">
      <Button variant={"ghost"} asChild>
        <Link href={"/hotel-listing"}>
          <ChevronLeft />
          Back
        </Link>
      </Button>

      <HotelForm />
    </div>
  );
};

export default CreateHotelPage;
