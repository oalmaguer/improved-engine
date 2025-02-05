"use client";

import { useState, useEffect } from "react";
import LatestImages from "./components/latest-images/latest-images";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const { user } = useUser();
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [useEnhanced, setUseEnhanced] = useState(true);
  const router = useRouter();

  const enhancePrompt = async (basePrompt: string) => {
    setIsEnhancing(true);

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: basePrompt }),
      });

      const data = await response.json();

      console.log(data.error);
      if (data.error) {
        throw new Error(data.error);
      }

      console.log("Enhanced prompt:", data.enhancedPrompt);
      setEnhancedPrompt(data.enhancedPrompt);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to enhance prompt. Please try again.");
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleEnhanceClick = () => {
    if (!user) {
      toast.error("Please sign in to enhance prompts");
      router.push("/auth");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    enhancePrompt(prompt);
  };

  const generateImage = async () => {
    if (!user) {
      toast.error("Please sign in to generate images");
      router.push("/auth");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    const finalPrompt = useEnhanced && enhancedPrompt ? enhancedPrompt : prompt;

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.imageUrl);

      // Save to Supabase with user_id
      const { error } = await supabase.from("images").insert([
        {
          prompt: finalPrompt,
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
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-16 pb-32">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Create stunning images
              <span className="block text-2xl sm:text-3xl text-gray-500 mt-4 font-normal">
                with the power of AI
              </span>
            </h1>
          </div>

          {/* Main Creation Area */}
          <div className="mt-16">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-8">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Prompt Input */}
                <div>
                  <label
                    htmlFor="prompt"
                    className="block text-base font-medium text-gray-900 mb-3"
                  >
                    What would you like to create?
                  </label>
                  <div className="space-y-3">
                    <div className="relative flex flex-col gap-3">
                      <div className="relative mb-5">
                        <input
                          type="text"
                          id="prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="block w-full px-4 py-3 pr-24 rounded-xl bg-gray-50 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                          placeholder="A serene Japanese garden with cherry blossoms..."
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                          <button
                            onClick={handleEnhanceClick}
                            disabled={isEnhancing}
                            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors duration-200 disabled:bg-gray-50 disabled:text-gray-400"
                          >
                            {isEnhancing ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>Enhancing...</span>
                              </div>
                            ) : (
                              "Enhance"
                            )}
                          </button>
                          <button
                            onClick={generateImage}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300"
                          >
                            {isLoading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Creating...</span>
                              </div>
                            ) : (
                              "Create"
                            )}
                          </button>
                        </div>
                      </div>

                      {enhancedPrompt && (
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-500">
                              Enhanced Prompt
                            </label>
                            <button
                              onClick={() => setUseEnhanced(!useEnhanced)}
                              className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
                                useEnhanced
                                  ? "bg-black text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {useEnhanced ? "Using Enhanced" : "Use Original"}
                            </button>
                          </div>
                          <div className="relative rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                            {isEnhancing ? (
                              <div className="flex items-center justify-center py-2">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              enhancedPrompt
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Example Prompts */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500">Try:</span>
                    {[
                      "A cyberpunk cityscape at sunset",
                      "Watercolor painting of mountains",
                      "Abstract geometric patterns",
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setPrompt(example)}
                        className="text-sm text-gray-600 hover:text-black bg-gray-50 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      >
                        {example}
                      </button>
                    ))}
                  </div>

                  {/* Generated Image Display */}
                  {generatedImage && (
                    <div className="relative mt-8 group">
                      <img
                        src={generatedImage}
                        alt="Generated image"
                        className="w-full rounded-2xl shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-2xl flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => router.push("/gallery")}
                            className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors duration-200"
                          >
                            View in Gallery
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Latest Images */}
          <div className="mt-16">
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              Latest Creations
            </h2>
            <LatestImages />
          </div>
        </div>

        {/* Bottom Gallery Link */}
        <div className="text-center pb-16 mt-10">
          <button
            onClick={() => router.push("/gallery")}
            className="text-gray-600 hover:text-black transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Browse Gallery</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
