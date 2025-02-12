"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type FontFamily =
  | "dm-serif"
  | "dm-sans"
  | "playfair"
  | "roboto"
  | "lora"
  | "montserrat"
  | "source-code"
  | "inter";

interface FontContextType {
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontFamily, setFontFamily] = useState<FontFamily>("source-code");

  return (
    <FontContext.Provider value={{ fontFamily, setFontFamily }}>
      <div className={fontFamily}>{children}</div>
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
}
