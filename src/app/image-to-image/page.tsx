"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";
import toast, { Toaster } from "react-hot-toast";
import ImageLightbox from "../components/image-lightbox/image-lightbox";

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
  const [imagePreview, setImagePreview] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [selectedStyles, setSelectedStyles] = useState<Set<any>>(new Set());

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const toggleStyle = (style: StyleKey) => {
    const newStyles = new Set(selectedStyles);
    if (newStyles.has(style)) {
      newStyles.delete(style);
    } else {
      newStyles.add(style);
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
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("prompt", prompt); // Send the main prompt
      // Append each selected style
      selectedStyles.forEach((styleKey) => {
        formData.append("styles", styles[styleKey].prompt);
      });

      const response = await fetch("/api/generate-image-to-image", {
        // Use the new API route
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error("No image URL in response");
      }

      const imageUrl = Array.isArray(data.imageUrl)
        ? data.imageUrl[0]
        : data.imageUrl;
      setGeneratedImage(imageUrl);

      // Save to Supabase
      const categories = Array.from(selectedStyles).map(
        (style) => styles[style].name
      );
      categories.push("Image to Image"); // Add category to distinguish from furniture transform
      const { error: supabaseError } = await supabase.from("images").insert([
        {
          prompt: prompt, // Save the user's main prompt, not style prompts
          image_url: imageUrl,
          user_id: user.id,
          categories: categories,
        },
      ]);

      if (supabaseError) throw supabaseError;
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate image"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 py-16 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-primary-100 mb-4">
            Transform Image
          </h1>
          <p className="text-lg text-primary-300/70">
            Transform any image with AI-powered style transfer
          </p>
        </div>

        <div className="space-y-8">
          {/* Image Upload Section */}
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-primary-500/10 p-8">
            <div className="mb-8">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-primary-500/20 border-dashed rounded-2xl cursor-pointer hover:border-primary-500/40 transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-56 rounded-lg"
                      />
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 text-primary-500/70 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <p className="text-sm text-primary-300/70">
                          Click to upload an image
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="mb-8">
              <label className="block text-base font-medium text-primary-100 mb-3">
                How would you like to transform it?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="block w-full px-4 py-3 pr-24 rounded-xl bg-dark-700/50 border border-primary-500/10 text-primary-100 placeholder:text-primary-400/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Turn it into a watercolor painting..."
                />
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <h3 className="text-base font-medium text-primary-100 mb-4">
                Choose Styles
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(Object.keys(styles) as StyleKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => toggleStyle(key)}
                    className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 
                      ${
                        selectedStyles.has(key)
                          ? "bg-primary-500 text-white shadow-glow"
                          : "bg-primary-500/10 text-primary-300 hover:bg-primary-500/20"
                      }`}
                  >
                    <span className="mr-2">{styles[key].icon}</span>
                    {styles[key].name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Image Display */}
          {generatedImage && (
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-primary-500/10 p-8">
              <h3 className="text-lg font-medium text-primary-100 mb-4">
                Result
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image */}
                <div>
                  <h4 className="text-sm text-primary-300/70 mb-2">
                    Original Image
                  </h4>
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <ImageLightbox
                      src={imagePreview}
                      alt="Original image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Transformed Image */}
                <div>
                  <h4 className="text-sm text-primary-300/70 mb-2">
                    Transformed Image
                  </h4>
                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <ImageLightbox
                      src={generatedImage}
                      alt="Transformed image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Download buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <a
                  href={imagePreview}
                  download="original-image.jpg"
                  className="px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full hover:bg-primary-500/20 transition-colors duration-200 text-sm font-medium border border-primary-500/20"
                >
                  Download Original
                </a>
                <a
                  href={generatedImage}
                  download="transformed-image.jpg"
                  className="px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full hover:bg-primary-500/20 transition-colors duration-200 text-sm font-medium border border-primary-500/20"
                >
                  Download Transformed
                </a>
              </div>
            </div>
          )}

          {/* Transform Button */}
          <button
            onClick={generateImage}
            disabled={isLoading || !selectedImage || !prompt.trim()}
            className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200
              ${
                isLoading || !selectedImage || !prompt.trim()
                  ? "bg-primary-500/50 cursor-not-allowed"
                  : "bg-primary-500 hover:bg-primary-600 shadow-glow hover:shadow-glow-lg"
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                Transforming...
              </div>
            ) : (
              "Transform Image"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
