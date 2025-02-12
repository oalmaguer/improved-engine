"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";

interface LikeButtonProps {
  imageId: number;
  initialLikes: number;
}

export default function LikeButton({ imageId, initialLikes }: LikeButtonProps) {
  const { user } = useUser();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  // Check if user has liked this image on component mount
  useEffect(() => {
    async function checkLikeStatus() {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("liked_images")
        .eq("id", user.id)
        .single();

      if (data && data.liked_images) {
        setIsLiked(data.liked_images.includes(imageId.toString()));
      }
    }

    checkLikeStatus();
  }, [user, imageId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to like images");
      return;
    }

    try {
      if (isLiked) {
        // Get current likes from images table
        const { data: currentData, error: currentError } = await supabase
          .from("images")
          .select("number_of_likes")
          .eq("id", imageId)
          .single();

        if (currentError) throw currentError;

        const currentLikes = currentData.number_of_likes || 0;
        const newLikes = Math.max(0, currentLikes - 1); // Ensure likes don't go below 0

        // Update number_of_likes in images table
        const { error: updateError } = await supabase
          .from("images")
          .update({ number_of_likes: newLikes })
          .eq("id", imageId);

        if (updateError) throw updateError;

        // Get current liked_images array
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("liked_images")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        const currentLikedImages = profileData.liked_images || [];
        const updatedLikedImages = currentLikedImages.filter(
          (id: string) => id !== imageId.toString()
        );

        // Update liked_images in profiles table
        const { error: unlikeError } = await supabase
          .from("profiles")
          .update({ liked_images: updatedLikedImages })
          .eq("id", user.id);

        if (unlikeError) throw unlikeError;

        setLikes(newLikes);
        setIsLiked(false);
      } else {
        // Get current likes from images table
        const { data: currentData, error: currentError } = await supabase
          .from("images")
          .select("number_of_likes")
          .eq("id", imageId)
          .single();

        if (currentError) throw currentError;

        const currentLikes = currentData.number_of_likes || 0;
        const newLikes = currentLikes + 1;

        // Update number_of_likes in images table
        const { error: updateError } = await supabase
          .from("images")
          .update({ number_of_likes: newLikes })
          .eq("id", imageId);

        if (updateError) throw updateError;

        // Get current liked_images array
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("liked_images")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        const currentLikedImages = profileData.liked_images || [];

        // Update liked_images in profiles table
        const { error: likeError } = await supabase
          .from("profiles")
          .update({
            liked_images: [...currentLikedImages, imageId.toString()],
          })
          .eq("id", user.id);

        if (likeError) throw likeError;

        setLikes(newLikes);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  return (
    <button
      onClick={handleLike}
      className="p-2 text-white/75 hover:text-white transition-colors duration-200 flex items-center space-x-1"
    >
      <svg
        className={`w-5 h-5 ${isLiked ? "fill-current" : "fill-none"}`}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="text-sm">{likes}</span>
    </button>
  );
}
