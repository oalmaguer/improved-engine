"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";
import { Toaster, toast } from "react-hot-toast";
import LikeButton from "../components/like-button/like-button";
import Card from "../components/card/card";

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

  const handleDelete = async (imageId: number) => {
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(images.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  useEffect(() => {
    async function fetchImages() {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setImages(data || []);
      } catch (error) {
        console.error('Error fetching images:', error);
        toast.error('Failed to load images');
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 py-16 px-4 sm:px-6 lg:px-8">
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
              <Card key={image.id} image={{
                ...image,
                onDelete: handleDelete
              }}/>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
