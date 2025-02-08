"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import { useUser } from "@/contexts/UserContext";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";
import { Toaster } from "react-hot-toast";
import CreatedImageCard from "../components/created-image-card/created-image-card";

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

const ITEMS_PER_PAGE = 12;

export default function Gallery() {
  const { user } = useUser();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const fetchImages = async (page: number) => {
    setLoading(true);
    try {
      // First, get total count for pagination
      let query = supabase.from("images").select("*", { count: "exact" });

      if (selectedCategory) {
        query = query.contains("categories", [selectedCategory]);
      }

      const { count } = await query;
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

      // Then fetch the current page
      let dataQuery = supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (selectedCategory) {
        dataQuery = dataQuery.contains("categories", [selectedCategory]);
      }

      const { data, error } = await dataQuery;

      if (error) throw error;
      setImages(data as Image[]);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(currentPage);
  }, [currentPage, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchImages(1);
    setIsRefreshing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 150) {
      // Scroll down
      if (currentPage < totalPages) {
        handlePageChange(currentPage + 1);
      }
    }
    if (touchStart - touchEnd < -150) {
      // Scroll up (refresh)
      handleRefresh();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const categories = [
    "Modern",
    "Scandinavian",
    "Industrial",
    "Bohemian",
    "Minimalist",
    "Contemporary",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 min-w-min">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                selectedCategory === null
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  selectedCategory === category
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={`${loading ? "mt-32" : "mt-[104px]"} md:mt-0`}>
          {/* Pull to refresh indicator */}
          {isRefreshing && (
            <div className="flex justify-center py-2 md:hidden">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image) => (
                  <CreatedImageCard
                    key={image.id}
                    id={image.id}
                    imageUrl={image.image_url}
                    prompt={image.prompt}
                    categories={image.categories}
                    createdAt={image.created_at}
                    user={image.profiles}
                    variant="grid"
                    showUser={true}
                  />
                ))}
              </div>

              {/* Mobile Load More Button */}
              <div className="md:hidden px-4 py-4 bg-white border-t border-gray-100 fixed bottom-0 left-0 right-0">
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="w-full py-3 px-4 rounded-full bg-black text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden md:flex mt-12 justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "bg-black text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
