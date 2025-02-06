"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import CopyPromptButton from "../copy-prompt-button/copy-prompt-button";
import ImageLightbox from "../image-lightbox/image-lightbox";
import LikeButton from "../like-button/like-button";

interface Image {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
  user_id: string;
  categories: string[];
  number_of_likes: number;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function LatestImages() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from("images")
          .select(
            `
            *,
            profiles:user_id (
              id,
              email,
              full_name,
              avatar_url
            )
          `
          )
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setImages(data || []);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white disabled:opacity-0"
        disabled={
          !scrollContainerRef.current ||
          scrollContainerRef.current.scrollLeft === 0
        }
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Images Slider */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 px-2"
      >
        {images.map((image) => (
          <div
            key={image.id}
            className="flex-none w-[300px] h-[300px] relative snap-start rounded-2xl overflow-hidden"
          >
            <ImageLightbox
              src={image.image_url}
              alt={image.prompt}
              className="w-full h-full"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-75 transition-all duration-200">
              <div className="absolute inset-0 p-4 text-white opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm line-clamp-3">{image.prompt}</p>
                    <LikeButton imageId={image.id} initialLikes={image.number_of_likes || 0} />
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

                <div className="flex justify-between items-end">
                  <Link
                    href={`/user/${image.user_id}`}
                    className="flex items-center space-x-3 group/profile"
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 ring-1 ring-transparent group-hover/profile:ring-white transition-all duration-200">
                      {image.profiles.avatar_url ? (
                        <img
                          src={image.profiles.avatar_url}
                          alt={image.profiles.full_name || "User avatar"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-800">
                          <span className="text-sm text-white font-medium">
                            {image.profiles?.full_name?.charAt(0).toUpperCase() ||
                              image.profiles?.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover/profile:text-white/90 transition-colors duration-200">
                        {image.profiles?.full_name ||
                          image.profiles?.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-300">
                        {new Date(image.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </Link>
                  <CopyPromptButton
                    prompt={image.prompt}
                    className="text-white/70 hover:text-white shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
