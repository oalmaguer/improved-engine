"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";
import LikeButton from "../components/like-button/like-button";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import { Toaster } from "react-hot-toast";

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

export default function Gallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from("images")
          .select(`
            *,
            profiles (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
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
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-gradient mb-4">Community Gallery</h1>
          <p className="text-lg text-primary-300/70 max-w-2xl mx-auto">
            Explore amazing transformations created by our community
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-dark-800/50 rounded-3xl overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-primary-500/10" />
              </div>
            ))
          ) : (
            images.map((image) => (
              <div
                key={image.id}
                className="group bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-primary-500/10 overflow-hidden hover:border-primary-500/20 transition-all duration-200"
              >
                <div className="aspect-square relative">
                  <ImageLightbox
                    src={image.image_url}
                    alt={`Creation ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center justify-between">
                      <LikeButton
                        imageId={image.id}
                        initialLikes={image.number_of_likes}
                      />
                      <CopyPromptButton
                        prompt={image.prompt}
                        className="text-primary-300/70 hover:text-primary-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* User Profile */}
                  <Link
                    href={`/profile/${image.profiles.id}`}
                    className="group/profile inline-flex items-center mb-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-300">
                      {image.profiles.avatar_url ? (
                        <img
                          src={image.profiles.avatar_url}
                          alt={image.profiles.full_name || "User"}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {image.profiles.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="ml-2 text-sm text-primary-300 group-hover/profile:text-primary-200 font-medium transition-colors duration-200">
                      {image.profiles.full_name ||
                        image.profiles.email.split("@")[0]}
                    </span>
                  </Link>

                  {/* Prompt */}
                  <p className="text-sm text-primary-200 line-clamp-2 mb-4">
                    {image.prompt}
                  </p>

                  {/* Creation Date */}
                  <p className="text-sm text-primary-400/50">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
