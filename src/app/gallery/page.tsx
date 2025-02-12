"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";
import LikeButton from "../components/like-button/like-button";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import { Toaster } from "react-hot-toast";
import Card from "../components/card/card";

// Add styles from your existing configuration
const styles = {
  all: {
    name: "All",
    icon: "🎨",
  },
  realistic: {
    name: "Realistic",
    icon: "📸",
  },
  anime: {
    name: "Anime",
    icon: "🎨",
  },
  medieval: {
    name: "Medieval",
    icon: "⚔️",
  },
  cyberpunk: {
    name: "Cyberpunk",
    icon: "🌆",
  },
  watercolor: {
    name: "Watercolor",
    icon: "🎨",
  },
  cartoon: {
    name: "Cartoon",
    icon: "✏️",
  },
} as const;

type StyleKey = keyof typeof styles;

interface Image {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
  number_of_likes: number;
  categories: string[];
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export default function Gallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<StyleKey>("all");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        let query = supabase.from("images").select(`
            *,
            profiles (
              id,
              email,
              full_name,
              avatar_url
            )
          `);

        // Apply sorting
        if (sortBy === "latest") {
          query = query.order("created_at", { ascending: false });
        } else if (sortBy === "popular") {
          query = query.order("number_of_likes", { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;
        setImages(data || []);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [sortBy]);

  const filteredImages = images.filter((image) => {
    if (selectedStyle === "all") return true;
    return image.prompt
      .toLowerCase()
      .includes(styles[selectedStyle].name.toLowerCase());
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredImages.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentImages = filteredImages.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStyle, sortBy, pageSize]);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // Show max 5 page numbers at a time
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Add first page button if not at start
    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          onClick={() => setCurrentPage(1)}
          className="px-3 py-1 rounded-lg text-sm bg-primary-500/10 text-primary-300 hover:bg-primary-500/20"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className="px-2 text-primary-300">
            ...
          </span>
        );
      }
    }

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-lg text-sm ${
            currentPage === i
              ? "bg-primary-500 text-white"
              : "bg-primary-500/10 text-primary-300 hover:bg-primary-500/20"
          }`}
        >
          {i}
        </button>
      );
    }

    // Add last page button if not at end
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots2" className="px-2 text-primary-300">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-1 rounded-lg text-sm bg-primary-500/10 text-primary-300 hover:bg-primary-500/20"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-gradient mb-4">Community Gallery</h1>
          <p className="text-lg text-primary-300/70 max-w-2xl mx-auto">
            Explore amazing transformations created by our community
          </p>
        </div>

        {/* Filter, Sort, and Page Size Controls */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(styles) as StyleKey[]).map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 
                  ${
                    selectedStyle === style
                      ? "bg-primary-500 text-white shadow-glow"
                      : "bg-primary-500/10 text-primary-300 hover:bg-primary-500/20"
                  }`}
              >
                <span className="mr-2">{styles[style].icon}</span>
                {styles[style].name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("latest")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 
                  ${
                    sortBy === "latest"
                      ? "bg-primary-500 text-white shadow-glow"
                      : "bg-primary-500/10 text-primary-300 hover:bg-primary-500/20"
                  }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 
                  ${
                    sortBy === "popular"
                      ? "bg-primary-500 text-white shadow-glow"
                      : "bg-primary-500/10 text-primary-300 hover:bg-primary-500/20"
                  }`}
              >
                Most Liked
              </button>
            </div>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-500/10 text-primary-300 border border-primary-500/20 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-dark-800/50 rounded-3xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-primary-500/10" />
                </div>
              ))
            : currentImages.map((image) => (
                <Card key={image.id} image={image} />
              ))}
        </div>

        {/* Pagination */}
        {/* {!loading && filteredImages.length > 0 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg text-sm bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {renderPaginationButtons()}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg text-sm bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )} */}

        {/* No Results Message */}
        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-primary-300/70">
              No images found for the selected filter.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Pagination */}
      {!loading && filteredImages.length > pageSize && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-lg border-t border-primary-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg text-sm bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {renderPaginationButtons()}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg text-sm bg-primary-500/10 text-primary-300 hover:bg-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
