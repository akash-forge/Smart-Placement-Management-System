import React from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col p-3 border border-3 lg:flex-row bg-white dark:bg-gray-900">
      {/* Left - College Image */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-auto overflow-hidden hidden lg:block">
        <img
          src="../images/logo/Clglogo.jpg" 
          alt="College Campus"
          className="object-cover rounded-md w-full h-full"
        />
      </div> 

      {/* Right - Auth Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 bg-white dark:bg-gray-800">
        {/* Theme Toggler */}
        <div className="fixed z-50 bottom-6 left-6 sm:block">
          <ThemeTogglerTwo />
        </div>

        <div className="max-w-md w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
