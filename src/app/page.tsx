"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const generateImage = async () => {
    if (!user) {
      toast.error("Please sign in to generate images");
      router.push("/auth");
      return;
    }

    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.imageUrl);

      // Save to Supabase with user_id
      const { error } = await supabase.from("images").insert([
        {
          prompt,
          image_url: data.imageUrl[0],
          user_id: user.id,
        },
      ]);

      if (error) throw error;
      toast.success("Image generated and saved successfully!");
    } catch (error) {
      toast.error("Failed to generate image");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8">
            AI Image Generator
          </h1>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-gray-700"
              >
                Enter your prompt
              </label>
              <input
                type="text"
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Describe the image you want to generate..."
              />
            </div>

            <button
              onClick={generateImage}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isLoading ? "Generating..." : "Generate Image"}
            </button>

            <button
              onClick={() => router.push("/gallery")}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Gallery
            </button>

            {generatedImage && (
              <div className="mt-4">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
