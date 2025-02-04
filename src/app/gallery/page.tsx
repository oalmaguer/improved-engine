"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Image {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
  user_id: string;
  profiles: {
    email: string;
  };
}

export default function Gallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Image Gallery</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Generate New Image
          </Link>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
              >
                <img
                  src={image.image_url}
                  alt={image.prompt}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 flex-1">
                  <p className="text-sm text-gray-600">Prompt:</p>
                  <p className="text-gray-900">{image.prompt}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm text-indigo-600">
                          {image.profiles?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {image.profiles?.email?.split("@")[0]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(image.created_at).toLocaleDateString()}
                    </p>
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
