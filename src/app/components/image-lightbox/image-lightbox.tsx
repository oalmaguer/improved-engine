"use client";

import { useState } from "react";

interface ImageLightboxProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ImageLightbox({ src, alt, className }: ImageLightboxProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <img
                src={src}
                alt={alt}
                className={`cursor-zoom-in ${className || ""}`}
                onClick={() => setIsOpen(true)}
            />

            {/* Lightbox Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="relative max-w-[90vw] max-h-[90vh]">
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm transition-all duration-200"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
