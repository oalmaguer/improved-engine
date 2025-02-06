"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import { useUser } from "@/contexts/UserContext";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";
import Image from "next/image";
import LikeButton from "../components/like-button/like-button";

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
  number_of_likes: number;
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
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-primary-100 mb-4">Gallery</h1>
          <p className="text-lg text-primary-300/70">
            Explore creations from our community
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            images.map((image) => (
              <div key={image.id} className="bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-primary-500/10 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      href={`/profile/${image.profiles?.id}`}
                      className="group/profile flex items-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
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
                      <span className="ml-2 text-sm text-primary-300 group-hover/profile:text-primary-200 font-medium transition-colors duration-200">
                        {image.profiles?.full_name || image.profiles?.email?.split("@")[0]}
                      </span>
                    </Link>
                    <div className="flex items-center space-x-4">
                      <p className="text-xs text-primary-400/50">
                        {new Date(image.created_at).toLocaleDateString()}
                      </p>
                      <CopyPromptButton
                        prompt={image.prompt}
                        className="text-primary-400/70 hover:text-primary-300 shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
