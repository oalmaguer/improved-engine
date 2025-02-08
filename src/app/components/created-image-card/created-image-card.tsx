"use client";

import Link from "next/link";
import CopyPromptButton from "../copy-prompt-button/copy-prompt-button";
import Image from "next/image";
import { useState } from "react";
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface CreatedImageCardProps {
  id: number;
  imageUrl: string;
  prompt: string;
  categories?: string[];
  createdAt: string;
  user: Profile;
  variant?: "grid" | "slider";
  width?: number;
  height?: number;
  showUser?: boolean;
}

export default function CreatedImageCard({
  imageUrl,
  prompt,
  categories,
  createdAt,
  user,
  variant = "grid",
  showUser = true,
  width = 300,
  height = 300,
}: CreatedImageCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const containerClasses = {
    grid: "bg-white aspect-square relative rounded-2xl overflow-hidden w-full max-w-sm mx-auto",
    slider:
      "flex-none w-[280px] sm:w-[300px] h-[280px] sm:h-[300px] relative snap-start rounded-2xl overflow-hidden",
  };

  const openLightbox = (imageUrl: string) => {
    console.log(imageUrl);
    setIsLightboxOpen(true);
  };

  return (
    <div className={containerClasses[variant]}>
      <div
        className="image-container "
        onClick={() => openLightbox(imageUrl)}
        style={{ cursor: "pointer" }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={prompt}
            className="absolute inset-0 w-full h-full object-cover"
            width={width}
            height={height}
            priority
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-75 transition-all duration-200">
          <div
            className={`absolute inset-0 p-3 sm:p-4 text-white opacity-0 hover:opacity-100 
            ${variant === "grid" ? "group-hover:opacity-100" : ""} 
            transition-opacity duration-200 flex flex-col justify-between`}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2 sm:gap-4">
                <p className="text-xs sm:text-sm line-clamp-3">{prompt}</p>
                <CopyPromptButton
                  prompt={prompt}
                  className="text-white/75 hover:text-white shrink-0"
                />
              </div>
              {categories && categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-white/20 text-white"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {showUser && (
              <Link
                href={`/user/${user?.id}`}
                className="flex items-center space-x-2 sm:space-x-3 group/profile"
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-gray-100 ring-1 ring-transparent group-hover/profile:ring-white transition-all duration-200">
                  {user?.avatar_url ? (
                    <img
                      src={user?.avatar_url}
                      alt={user?.full_name || "User avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-800">
                      <span className="text-xs sm:text-sm text-white font-medium">
                        {user?.full_name?.charAt(0).toUpperCase() ||
                          user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white group-hover/profile:text-white/90 transition-colors duration-200">
                    {user?.full_name || user?.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-300">
                    {new Date(createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
        >
          <Image
            src={imageUrl}
            alt={prompt}
            className="max-w-full max-h-full"
            width={window.innerWidth * 0.5}
            height={window.innerHeight * 0.2}
            priority
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setIsLightboxOpen(false)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
