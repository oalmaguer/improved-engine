"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import CopyPromptButton from "../copy-prompt-button/copy-prompt-button";
import Image from "next/image";
import ImageLightbox from "../image-lightbox/image-lightbox";
import CreatedImageCard from "../created-image-card/created-image-card";

interface Image {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
  user_id: string;
  categories: string[];
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

        console.log(data);
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

      <button className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white">
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
      <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 px-2">
        {images &&
          images.length > 0 &&
          images.map((image) => {
            console.log(typeof image.image_url);
            if (typeof image.image_url !== "string") {
              image.image_url = "https://placehold.co/300x300";
            }

            console.log(image);

            return (
              <CreatedImageCard
                key={image.id}
                id={image.id}
                imageUrl={image.image_url}
                prompt={image.prompt}
                categories={image.categories}
                createdAt={image.created_at}
                user={image.profiles}
                variant="slider"
              />
            );
          })}
      </div>
    </div>
  );
}
