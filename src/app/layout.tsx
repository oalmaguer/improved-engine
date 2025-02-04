import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/navbar/navbar";

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Generate images using AI and Replicate API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
