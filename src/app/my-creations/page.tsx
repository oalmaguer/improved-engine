"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";
import { Toaster } from "react-hot-toast";
import CreatedImageCard from "../components/created-image-card/created-image-card";

interface Image {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
  categories: string[];
  profiles: {
    email: string;
  };
}

export default function MyCreations() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-medium text-gray-900">My Creations</h1>
            <p className="mt-2 text-lg text-gray-500">
              Your AI-generated masterpieces
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2.5 bg-pink-500/10 text-pink-700 rounded-full hover:bg-pink-500/20 transition-colors duration-200 text-sm font-medium"
          >
            Create New
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-pink-100">
            <div className="w-20 h-20 mb-6 text-pink-200">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              No creations yet
            </h2>
            <p className="text-gray-500 mb-8">
              Start creating amazing AI-generated images
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-2.5 bg-black text-white rounded-full hover:bg-gray-900 transition-colors duration-200 text-sm font-medium"
            >
              Create Your First Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                showUser={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
