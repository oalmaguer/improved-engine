"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface UserImage {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
  categories: string[];
}

export default function UserProfile() {
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", params.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profile);

        // Fetch user's images
        const { data: images, error: imagesError } = await supabase
          .from("images")
          .select("*")
          .eq("user_id", params.id)
          .order("created_at", { ascending: false });

        if (imagesError) throw imagesError;
        setImages(images || []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-medium text-gray-900">User not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Profile Header */}
        <div className="mb-16">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "User avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-50">
                  <span className="text-2xl text-gray-500 font-medium">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-medium text-gray-900">
                {profile.full_name || "Anonymous User"}
              </h1>
              {profile.bio && (
                <p className="mt-2 text-gray-600 max-w-2xl">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative bg-gray-50 rounded-2xl overflow-hidden aspect-square"
            >
              <img
                src={image.image_url}
                alt={image.prompt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-75 transition-all duration-200 flex items-end">
                <div className="p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-sm line-clamp-3">{image.prompt}</p>
                  {image.categories && image.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {image.categories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs mt-2 text-gray-300">
                    {new Date(image.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No images created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
