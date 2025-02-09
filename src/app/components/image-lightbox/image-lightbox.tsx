"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
}

export default function ImageLightbox({
  src,
  alt,
  children,
  className,
  triggerClassName,
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isOpen) {
      // Lock scroll when lightbox is open
      document.body.style.overflow = "hidden";

      // Calculate optimal dimensions
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        const windowWidth = window.innerWidth * 0.9;
        const windowHeight = window.innerHeight * 0.9;
        const imageRatio = img.width / img.height;
        const windowRatio = windowWidth / windowHeight;

        let width, height;
        if (imageRatio > windowRatio) {
          width = windowWidth;
          height = windowWidth / imageRatio;
        } else {
          height = windowHeight;
          width = windowHeight * imageRatio;
        }

        setDimensions({ width, height });
      };
    } else {
      // Restore scroll when lightbox is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, src]);

  return (
    <>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(true)}
        className={`cursor-pointer ${triggerClassName || ""}`}
      >
        {children || (
          <Image
            src={src}
            alt={alt}
            width={400}
            height={400}
            className={`w-full h-full object-cover ${className || ""}`}
          />
        )}
      </div>

      {/* Lightbox */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors duration-200 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <div className="relative animate-fadeIn">
              <Image
                src={src}
                alt={alt}
                width={dimensions.width}
                height={dimensions.height}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                quality={95}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
