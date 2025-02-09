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
    const [isLiking, setIsLiking] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        // Check if the user has already liked this image
        const checkIfLiked = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('liked_images')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error checking liked status:', error);
                return;
            }

            setIsLiked(data.liked_images?.includes(imageId.toString()) || false);
        };

        checkIfLiked();
    }, [user, imageId]);

    const handleLike = async () => {
        if (!user) {
            toast.error("Please sign in to like images");
            return;
        }

        if (isLiking) return;
        if (isLiked) return; // Prevent liking again if already liked

        setIsLiking(true);
        try {
            // Get current likes from images table
            const { data: currentData, error: currentError } = await supabase
                .from('images')
                .select('number_of_likes')
                .eq('id', imageId)
                .single();

            if (currentError) throw currentError;

            const currentLikes = currentData.number_of_likes || 0;
            const newLikes = currentLikes + 1;

            // Update number_of_likes in images table
            const { error: updateError } = await supabase
                .from('images')
                .update({ number_of_likes: newLikes })
                .eq('id', imageId);

            if (updateError) throw updateError;

            // Get current liked_images array
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('liked_images')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            const currentLikedImages = profileData.liked_images || [];

            // Update liked_images in profiles table
            const { error: likeError } = await supabase
                .from('profiles')
                .update({
                    liked_images: [...currentLikedImages, imageId.toString()]
                })
                .eq('id', user.id);

            if (likeError) throw likeError;

            setLikes(newLikes);
            setIsLiked(true);
            toast.success('Image liked!');
        } catch (error) {
            console.error('Error liking image:', error);
            toast.error('Failed to like image');
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={isLiking || isLiked}
            className={`flex items-center space-x-1 text-sm transition-colors duration-200 ${isLiked
                ? "text-primary-500 cursor-default"
                : "text-primary-400/70 hover:text-primary-500"
                }`}
        >
            <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
            >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{likes}</span>
        </button>
    );
}
