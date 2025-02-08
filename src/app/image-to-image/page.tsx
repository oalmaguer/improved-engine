"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";
import toast, { Toaster } from "react-hot-toast";

const styles = {
  realistic: {
    name: "Realistic",
    prompt:
      "photorealistic, highly detailed, professional photography, 8k resolution, sharp focus",
    icon: "📸",
  },
  anime: {
    name: "Anime",
    prompt:
      "anime style, Studio Ghibli, vibrant colors, cel shading, detailed anime illustration",
    icon: "🎨",
  },
  medieval: {
    name: "Medieval",
    prompt:
      "medieval fantasy art, oil painting style, detailed fantasy illustration, dramatic lighting",
    icon: "⚔️",
  },
  cyberpunk: {
    name: "Cyberpunk",
    prompt:
      "cyberpunk style, neon lights, futuristic, high tech, digital art, sci-fi concept art",
    icon: "🌆",
  },
  watercolor: {
    name: "Watercolor",
    prompt:
      "watercolor painting, artistic, soft colors, flowing textures, traditional art style",
    icon: "🎨",
  },
  cartoon: {
    name: "Cartoon",
    prompt:
      "cartoon style, bold colors, clean lines, stylized illustration, character design",
    icon: "✏️",
  },
} as const;

type StyleKey = keyof typeof styles;

export default function ImageToImage() {
  const { user } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<Set<StyleKey>>(
    new Set()
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleToggle = (key: StyleKey) => {
    const newStyles = new Set(selectedStyles);
    const stylePrompt = styles[key].prompt;

    if (newStyles.has(key)) {
      // Remove the style
      newStyles.delete(key);
      // Remove the style's prompt, handling both first prompt and subsequent prompts
      if (prompt === stylePrompt) {
        setPrompt("");
      } else if (prompt.includes(`, ${stylePrompt}`)) {
        setPrompt(prompt.replace(`, ${stylePrompt}`, ""));
      } else if (prompt.includes(`${stylePrompt}, `)) {
        setPrompt(prompt.replace(`${stylePrompt}, `, ""));
      }
    } else {
      // Add the style
      newStyles.add(key);
      // Add the style's prompt to the input
      const newPrompt = prompt ? `${prompt}, ${stylePrompt}` : stylePrompt;
      setPrompt(newPrompt);
    }
    setSelectedStyles(newStyles);
  };

  const generateImage = async () => {
    if (!user) {
      toast.error("Please sign in to generate images");
      router.push("/auth");
      return;
    }

    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the prompt with selected styles
      let finalPrompt = prompt;
      if (selectedStyles.size > 0) {
        const stylePrompts = Array.from(selectedStyles)
          .map((style) => styles[style].prompt)
          .join(", ");
        finalPrompt += `, ${stylePrompts}`;
      }

      // Create form data
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("prompt", finalPrompt);

      const response = await fetch("/api/image-to-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();
      console.log("API Success Response:", data);

      if (!data.imageUrl) {
        throw new Error("No image URL in response");
      }

      setGeneratedImage(
        Array.isArray(data.imageUrl) ? data.imageUrl[0] : data.imageUrl
      );

      // Save to Supabase
      const { error } = await supabase.from("images").insert([
        {
          prompt: finalPrompt,
          image_url: data.imageUrl[0],
          user_id: user.id,
          categories: Array.from(selectedStyles).map(
            (style) => styles[style].name
          ),
        },
      ]);

      if (error) throw error;
      toast.success("Image generated and saved successfully!");
    } catch (error) {
      console.error("Generation Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image"
      );
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
              Transform your images
              <span className="block text-2xl sm:text-3xl text-gray-500 mt-4 font-normal">
                with the power of AI
              </span>
            </h1>
          </div>

          {/* Main Creation Area */}
          <div className="mt-16">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-8">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Style Selector */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    Choose Styles (Optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.keys(styles) as StyleKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => handleStyleToggle(key)}
                        className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedStyles.has(key)
                            ? "bg-black text-white ring-2 ring-black ring-offset-2"
                            : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <span className="mr-2">{styles[key].icon}</span>
                        {styles[key].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-3">
                    Upload your image
                  </label>
                  <div className="mt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto max-h-48 object-contain"
                        />
                      ) : (
                        <div>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            />
                          </svg>
                          <div className="mt-4 flex text-sm text-gray-600">
                            <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                              Upload an image
                            </span>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prompt Input */}
                <div>
                  <label
                    htmlFor="prompt"
                    className="block text-base font-medium text-gray-900 mb-3"
                  >
                    How would you like to transform it?
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="block w-full px-4 py-3 pr-24 rounded-xl bg-gray-50 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                      placeholder="Turn it into a watercolor painting..."
                    />
                    <button
                      onClick={generateImage}
                      disabled={isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </div>
                      ) : (
                        "Transform"
                      )}
                    </button>
                  </div>
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
      </div>
    </div>
  );
}
