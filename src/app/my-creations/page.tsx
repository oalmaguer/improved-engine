"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import ImageLightbox from "../components/image-lightbox/image-lightbox";

interface Image {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-gray-600">Loading your creations...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">My Creations</h1>
        <p className="text-gray-600">You haven't created any images yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">My Creations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <ImageLightbox
              src={image.image_url}
              alt={image.prompt}
              className="w-full h-64"
            />
            <div className="p-4">
              <p className="text-gray-600 text-sm">{image.prompt}</p>
              <p className="text-gray-400 text-xs mt-2">
                {new Date(image.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
