"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ImageModal from "../image-modal/image-modal";
import CopyPromptButton from "../copy-prompt-button/copy-prompt-button";
import LikeButton from "../like-button/like-button";
import { useId } from "react";

interface CardProps {
  image: {
    id: number;
    prompt: string;
    image_url: string;
    created_at: string;
    number_of_likes: number;
    categories?: string[];
    profiles: {
      id: string;
      email: string;
      full_name: string | null;
      avatar_url: string | null;
    };
    onDelete?: (id: number) => void;
  };
  variant?: "grid" | "slider";
}

export default function Card({ image, variant = "grid" }: any) {
  const id = useId();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerClasses = {
    grid: "bg-dark-800/50 aspect-square relative rounded-3xl overflow-hidden group/card",
    slider:
      "bg-dark-800/50 aspect-square relative rounded-3xl overflow-hidden group/card",
  };

  const userProfileUrl = image.profiles?.id
    ? `/user/${image.profiles.id}`
    : "#";

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = target.closest("button, a, .interactive");
    if (!isInteractive) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={containerClasses[variant]}
        style={{
          cursor: "pointer",
          viewTransitionName: `card-${image.id}`,
        }}
        onClick={handleCardClick}
      >
        <Image
          src={image.image_url}
          alt={image.prompt}
          fill
          className="object-cover transition-transform duration-300 group-hover/card:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ viewTransitionName: `image-${image.id}` }}
        />

        {/* Overlay with transition */}
        <div
          className="absolute inset-0 bg-black opacity-0 group-hover/card:opacity-75 transition-opacity duration-200"
          style={{ viewTransitionName: `overlay-${image.id}` }}
        />

        {/* Content with transition */}
        <div
          className="absolute inset-0 p-4 text-white opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex flex-col justify-between"
          style={{ viewTransitionName: `content-${image.id}` }}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm line-clamp-3">{image.prompt}</p>
              <CopyPromptButton
                prompt={image.prompt}
                className="text-white/75 hover:text-white shrink-0"
              />
            </div>
            {image.categories && image.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {image.categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={userProfileUrl}
              className="flex items-center space-x-2 group/profile"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-dark-700 ring-2 ring-transparent group-hover/profile:ring-white/50 transition-all duration-200">
                {image.profiles?.avatar_url ? (
                  <img
                    src={image.profiles.avatar_url}
                    alt={image.profiles.full_name || "User avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-dark-600">
                    <span className="text-xs text-white font-medium">
                      {image.profiles?.full_name?.charAt(0).toUpperCase() ||
                        image.profiles?.email?.charAt(0).toUpperCase() ||
                        "?"}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover/profile:text-white/75 transition-colors duration-200">
                  {image.profiles?.full_name ||
                    image.profiles?.user_name?.split("@")[0] ||
                    "Anonymous"}
                </p>
                <p className="text-xs text-white/70">
                  {new Date(image.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </Link>

            <div className="flex items-center space-x-2 interactive">
              <LikeButton
                imageId={image.id}
                initialLikes={image.number_of_likes}
              />
              {image.onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    image.onDelete(image.id);
                  }}
                  className="p-2 text-white/75 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <ImageModal
          imageUrl={image.image_url}
          alt={image.prompt}
          imageId={image.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
