"use client";

import { useEffect } from "react";
import Image from "next/image";
import Comments from "../comments/comments";
import CopyPromptButton from "../copy-prompt-button/copy-prompt-button";

interface ImageModalProps {
  imageUrl: string;
  alt: string;
  imageId: number;
  prompt: string;
  styles?: string[];
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export default function ImageModal({
  imageUrl,
  alt,
  imageId,
  prompt,
  styles = [],
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: ImageModalProps) {
  // Close modal when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext && onNext) onNext();
      if (e.key === "ArrowLeft" && hasPrevious && onPrevious) onPrevious();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, onNext, onPrevious, hasNext, hasPrevious]);

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

        {/* Navigation Arrows */}
        {hasPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/75 hover:text-white transition-colors duration-200 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/75 hover:text-white transition-colors duration-200 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

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
            <div className="h-full overflow-y-auto animate-fadeIn scrollbar-hide">
              {/* Image Details Section */}
              <div className="p-8 border-b border-primary-500/10">
                <h3 className="text-lg font-medium text-primary-100 mb-4">
                  Image Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-primary-200 mb-2">
                      Prompt
                    </h4>
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-primary-100/90 flex-1">
                        {prompt}
                      </p>
                      <CopyPromptButton
                        prompt={prompt}
                        className="text-primary-300/75 hover:text-primary-200 shrink-0 mt-0.5"
                      />
                    </div>
                  </div>
                  {styles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-primary-200 mb-2">
                        Styles
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {styles.map((style, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium text-primary-100 bg-primary-500/10 rounded-lg"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="p-8">
                <Comments imageId={imageId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
