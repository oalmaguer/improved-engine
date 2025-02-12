"use client";

import { useState } from "react";
import { useFont } from "@/contexts/FontContext";

const fonts = {
  "dm-serif": "DM Serif Display",
  "dm-sans": "DM Sans",
  playfair: "Playfair Display",
  roboto: "Roboto",
  lora: "Lora",
  montserrat: "Montserrat",
  "source-code": "Source Code Pro",
  inter: "Inter",
} as const;

export default function FontSwitcher() {
  const { fontFamily, setFontFamily } = useFont();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-20 right-4 z-50 hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-dark-800/95 backdrop-blur-lg border border-primary-500/10 rounded-lg text-primary-300 hover:text-primary-200 transition-colors duration-200 flex items-center space-x-2"
      >
        <span>Font: {fonts[fontFamily]}</span>
        <svg
          className={`w-4 h-4 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-dark-800/95 backdrop-blur-lg border border-primary-500/10 rounded-lg shadow-xl overflow-hidden">
          {Object.entries(fonts).map(([key, name]) => (
            <button
              key={key}
              onClick={() => {
                setFontFamily(key as keyof typeof fonts);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-primary-500/10 transition-colors duration-200 ${
                fontFamily === key ? "text-primary-300" : "text-primary-300/70"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
