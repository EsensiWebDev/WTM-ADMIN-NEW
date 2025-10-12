import HeroSection from "@/components/hero-section";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import React from "react";

const Page = async () => {
  const session = await getServerSession(authOptions);

  console.log({ session });

  return (
    <div>
      <HeroSection />
    </div>
  );
};

export default Page;
