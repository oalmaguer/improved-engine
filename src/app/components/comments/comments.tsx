"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  image_id: number;
  is_edited: boolean;
  likes_count: number;
  user_name: string | null;

  profiles: {
    user_name: string | null;
    avatar_url: string | null;
    full_name: string | null;
    email: string | null;
  };
}

interface CommentsProps {
  imageId: number;
}

export default function Comments({ imageId }: CommentsProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (imageId) {
      console.log("Fetching comments for image:", imageId);
      fetchComments();
    }
  }, [imageId]);

  const fetchComments = async () => {
    console.log("Fetching comments for image:", imageId);
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *
        )
      `
      )
      .eq("image_id", imageId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
      return;
    }

    console.log("Fetched comments:", data);
    setComments(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      // First check if the image exists
      const { data: imageExists } = await supabase
        .from("images")
        .select("id")
        .eq("id", imageId)
        .single();

      if (!imageExists) {
        throw new Error("Image not found");
      }

      // Get the user's profile data
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      console.log("User profile:", userProfile);
      console.log("User:", user);

      const { error } = await supabase.from("comments").insert({
        content: newComment.trim(),
        image_id: imageId,
        user_id: user.id,
        user_name: userProfile?.username,
      });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="border-b border-primary-500/10 pb-4">
        <h3 className="text-lg font-medium text-primary-100">Comments</h3>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Write a comment..." : "Sign in to comment"}
          disabled={!user || isLoading}
          className="w-full px-4 py-3 text-sm bg-dark-900/50 rounded-xl border border-primary-500/10 placeholder-primary-300/50 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 text-primary-100"
          rows={2}
        />
        {user && (
          <button
            type="submit"
            disabled={isLoading || !newComment.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors duration-200 w-full"
          >
            {isLoading ? "Posting..." : "Post Comment"}
          </button>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(
          (comment) => (
            console.log("Comment:", comment),
            (
              <div
                key={comment.id}
                className="group p-4 rounded-xl bg-dark-900/50 border border-primary-500/5 hover:border-primary-500/10 transition-all duration-200"
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar with Link */}
                  <Link href={`/user/${comment.user_id}`}>
                    <img
                      src={comment?.user_id || "/default-avatar.png"}
                      alt={comment?.user_name || "User"}
                      className="w-8 h-8 rounded-full ring-2 ring-primary-500/10 cursor-pointer hover:ring-primary-500/30 transition-all duration-200"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {/* Username with Link */}
                      <Link
                        href={`/user/${comment.user_id}`}
                        className="text-sm font-medium text-primary-200 hover:text-primary-300 transition-colors duration-200"
                      >
                        {comment?.user_name?.split("@")[0] || "Anonymous"}
                      </Link>
                      <span className="text-xs text-primary-300/50">•</span>
                      <span className="text-xs text-primary-300/50">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {comment.is_edited && (
                        <>
                          <span className="text-xs text-primary-300/50">•</span>
                          <span className="text-xs text-primary-300/50">
                            edited
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-primary-100/90 break-words">
                      {comment.content}
                    </p>

                    {/* Comment Actions */}
                    <div className="mt-2 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {user && (
                        <>
                          <button className="text-xs text-primary-300/50 hover:text-primary-300 transition-colors duration-200">
                            Like
                          </button>
                          <button className="text-xs text-primary-300/50 hover:text-primary-300 transition-colors duration-200">
                            Reply
                          </button>
                          {user.id === comment.user_id && (
                            <button className="text-xs text-primary-300/50 hover:text-primary-300 transition-colors duration-200">
                              Edit
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
