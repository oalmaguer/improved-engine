"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";
import { Toaster, toast } from "react-hot-toast";
import LikeButton from "../components/like-button/like-button";
import Card from "../components/card/card";
import { useRouter } from "next/navigation";

interface Image {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
  number_of_likes: number;
  categories: string[];
  profiles: {
    email: string;
  };
}

export default function MyCreations() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 9;
  const router = useRouter();

  const handleDelete = async (imageId: number) => {
    try {
      const { error } = await supabase
        .from("images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      setImages(images.filter((img) => img.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  useEffect(() => {
    async function fetchImages() {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("images")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setImages(data || []);
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to load images");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  // Filter images based on search query
  const filteredImages = images.filter((image) =>
    image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const paginatedImages = filteredImages.slice(
    startIndex,
    startIndex + imagesPerPage
  );

  const navigateWithTransition = (url: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        router.push(url);
      });
    } else {
      router.push(url);
    }
  };

  // Use this function when navigating between pages
  const handleCardClick = (imageId: number) => {
    navigateWithTransition(`/image/${imageId}`);
  };

  // Add this function to render pagination buttons
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
      <div className="pb-24">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-medium text-primary-100 mb-4">
              My Creations
            </h1>
            <p className="text-lg text-primary-300/70">
              View and manage your generated images
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search your creations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded-xl bg-dark-800 border border-primary-500/10 text-primary-100 placeholder-primary-300/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
            ) : paginatedImages.length > 0 ? (
              paginatedImages.map((image) => (
                <Card
                  key={image.id}
                  image={{
                    ...image,
                    onDelete: handleDelete,
                  }}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-primary-300/70">
                  {searchQuery
                    ? "No images found matching your search."
                    : "You haven't created any images yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Pagination */}
      {!loading && filteredImages.length > imagesPerPage && (
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
