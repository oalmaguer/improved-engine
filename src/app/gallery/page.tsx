"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import { useUser } from "@/contexts/UserContext";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";

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

export default function Gallery() {
  const { user } = useUser();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

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
          .order("created_at", { ascending: false });

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

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-medium text-gray-900">Gallery</h1>
          <Link
            href="/"
            className="px-6 py-2.5 bg-black text-white rounded-full hover:bg-gray-900 transition-colors duration-200 text-sm font-medium"
          >
            Create New
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((image) => (
              <div key={image.id} className="group">
                <div className="relative bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:shadow-lg">
                  <ImageLightbox
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full aspect-square"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                          Prompt
                        </p>
                        <p className="text-gray-900 line-clamp-2 text-sm">
                          {image.prompt}
                        </p>
                      </div>
                      <CopyPromptButton
                        prompt={image.prompt}
                        className="text-gray-400 hover:text-gray-900 shrink-0"
                      />
                    </div>
                    {image.categories && image.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {image.categories.map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <Link
                        href={`/user/${image.user_id}`}
                        className="flex items-center group/profile"
                      >
                        <div className="h-8 w-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center ring-1 ring-transparent group-hover/profile:ring-black transition-all duration-200">
                          {image.profiles?.avatar_url ? (
                            <img
                              src={image.profiles.avatar_url}
                              alt={image.profiles.full_name || "User avatar"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm text-gray-600 font-medium">
                              {image.profiles?.full_name
                                ?.charAt(0)
                                .toUpperCase() ||
                                image.profiles?.email?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="ml-2 text-sm text-gray-600 group-hover/profile:text-black font-medium transition-colors duration-200">
                          {image.profiles?.full_name ||
                            image.profiles?.email?.split("@")[0]}
                        </span>
                      </Link>
                      <p className="text-xs text-gray-400">
                        {new Date(image.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
