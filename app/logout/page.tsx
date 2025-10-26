"use client";

// import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

const LogoutPage = () => {
  useEffect(() => {
    // Redirect to login page after short delay
    const timer = setTimeout(async () => {
      await signOut({ callbackUrl: "/login" });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600 text-lg">Logging out...</p>
    </div>
  );
};

export default LogoutPage;
