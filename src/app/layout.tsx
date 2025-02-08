"use client";

import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import Sidebar from "./components/sidebar/sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobileOptimizedRoute = ["/gallery", "/my-creations"].includes(
    pathname
  );

  return (
    <html lang="en" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="h-full">
        <UserProvider>
          <div className="flex h-full">
            <Sidebar />
            <main
              className={`flex-1 ${
                isMobileOptimizedRoute ? "" : "md:ml-[240px]"
              } ${isMobileOptimizedRoute ? "pb-20 md:pb-0" : ""}`}
            >
              {children}
            </main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
