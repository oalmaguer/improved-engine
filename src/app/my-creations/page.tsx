"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";
import { Toaster, toast } from "react-hot-toast";

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

  const handleLike = async (imageId: number) => {
    try {
      // Fetch current number_of_likes
      const { data: currentData, error: currentError } = await supabase
        .from('images')
        .select('number_of_likes')
        .eq('id', imageId)
        .single();

      if (currentError) throw currentError;

      const currentLikes = currentData.number_of_likes;

      // Update number_of_likes by incrementing
      const { data, error } = await supabase
        .from('images')
        .update({ number_of_likes: currentLikes + 1 })
        .eq('id', imageId);

      if (error) throw error;

      // Update local state
      setImages(prevImages =>
        prevImages.map(image =>
          image.id === imageId
            ? { ...image, number_of_likes: image.number_of_likes + 1 }
            : image
        )
      );
    } catch (error) {
      console.error('Error liking image:', error);
      toast.error('Failed to like image');
    }
  };

  useEffect(() => {
    async function loadUserImages() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const { data, error } = await supabase
            .from("images")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;
          setImages(data || []);
        }
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserImages();
  }, []);

  return (
    <div className="min-h-screen  py-16 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-primary-100 mb-4">My Creations</h1>
          <p className="text-lg text-primary-300/70">
            View and manage your generated images
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
                <div className="aspect-square relative">
                  <ImageLightbox
                    src={
                      image.image_url.startsWith("http")
                        ? image.image_url
                        : `/images/${image.image_url}`
                    }
                    alt={'Image' + image.id}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => handleLike(image.id)}
                      className="flex items-center space-x-1 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white hover:bg-black/40 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="text-sm">{image.number_of_likes}</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-primary-300/70">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                    <CopyPromptButton
                      prompt={image.prompt}
                      className="text-primary-400/70 hover:text-primary-300 shrink-0"
                    />
                  </div>
                  {image.categories && image.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {image.categories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-500/10 text-primary-300 border border-primary-500/20"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-primary-500/10 flex justify-between items-center">
                    <p className="text-xs text-primary-300/50">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => {
                        /* Add delete functionality */
                      }}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors duration-200"
                    >
                      Delete
                    </button>
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
