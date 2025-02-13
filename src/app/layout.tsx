"use client";

import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/navbar/navbar";
import { UserProvider } from "@/contexts/UserContext";
import { TokenProvider } from "@/contexts/TokenContext";
import {
  Outfit,
  Plus_Jakarta_Sans,
  DM_Serif_Display,
  DM_Sans,
  Playfair_Display,
  Roboto,
  Lora,
  Montserrat,
  Source_Code_Pro,
  Inter,
} from "next/font/google";
import { FontProvider } from "@/contexts/FontContext";
import FontSwitcher from "./components/font-switcher/font-switcher";
import { ViewTransitions } from "next-view-transitions";
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const sourceCode = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${outfit.variable} ${plusJakartaSans.variable} ${dmSerif.variable} ${dmSans.variable} ${playfair.variable} ${roboto.variable} ${lora.variable} ${montserrat.variable} ${sourceCode.variable} ${inter.variable} dark`}
      >
        <head>
          <meta name="view-transition" content="same-origin" />
        </head>
        <body className="bg-dark-950 text-white">
          <UserProvider>
            <TokenProvider>
              <FontProvider>
                <FontSwitcher />
                <Navbar />
                {children}
                <Toaster position="top-center" />
              </FontProvider>
            </TokenProvider>
          </UserProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
