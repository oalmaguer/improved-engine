"use client";

import { useEffect } from "react";
import Image from "next/image";
import Comments from "../comments/comments";

interface ImageModalProps {
  imageUrl: string;
  alt: string;
  imageId: number;
  onClose: () => void;
}

export default function ImageModal({
  imageUrl,
  alt,
  imageId,
  onClose,
}: ImageModalProps) {
  // Close modal when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative h-screen w-screen flex">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 text-white/75 hover:text-white transition-colors duration-200"
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

        {/* Content Container */}
        <div className="flex w-full h-full">
          {/* Image Section - Left Half */}
          <div className="w-1/2 h-full p-8 flex items-center justify-center bg-dark-950/50">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={imageUrl}
                alt={alt}
                width={1920}
                height={1080}
                className="max-w-full max-h-full object-contain rounded-xl animate-fadeIn"
                quality={100}
                priority
              />
            </div>
          </div>

          {/* Comments Section - Right Half */}
          <div className="w-1/2 h-full bg-dark-800/95 backdrop-blur-sm border-l border-primary-500/10">
            <div className="h-full overflow-y-auto p-8 animate-fadeIn scrollbar-hide">
              <Comments imageId={imageId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
