"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import CopyPromptButton from "../components/copy-prompt-button/copy-prompt-button";
import { Toaster, toast } from "react-hot-toast";
import LikeButton from "../components/like-button/like-button";

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
              <div key={image.id} className="group bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-primary-500/10 overflow-hidden hover:border-primary-500/20 transition-all duration-200">
                <div className="aspect-square relative">
                  <ImageLightbox
                    src={image.image_url}
                    alt={`Creation ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center justify-between">
                      <LikeButton imageId={image.id} initialLikes={image.number_of_likes} />
                      <CopyPromptButton
                        prompt={image.prompt}
                        className="text-primary-300/70 hover:text-primary-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-primary-200 line-clamp-2">{image.prompt}</p>
                  </div>

                  {image.categories && image.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {image.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 text-xs font-medium bg-primary-500/10 text-primary-300 rounded-full border border-primary-500/20"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-primary-500/10">
                    <p className="text-sm text-primary-400/50">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="text-sm text-primary-400/70 hover:text-primary-300 transition-colors duration-200"
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
