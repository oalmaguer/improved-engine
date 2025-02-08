"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageLightbox({
  src,
  alt,
  className = "",
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`cursor-pointer ${className}`}
      ></div>
      <Image
        onClick={() => setIsOpen(true)}
        src={src}
        alt={alt}
        width={400}
        height={400}
        className="rounded-2xl w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.1]"
      />
      {/* Lightbox overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-all duration-300 ease-in-out"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors duration-200 focus:outline-none z-10 backdrop-blur-sm bg-black/20 p-2 rounded-full"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image container with animation */}
            <div className="relative w-full h-full flex items-center justify-center animate-fadeIn">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                priority
                quality={95}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
