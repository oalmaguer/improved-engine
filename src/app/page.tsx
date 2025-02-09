"use client";

import { useState, useEffect } from "react";
import LatestImages from "./components/latest-images/latest-images";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { useTokens } from "@/contexts/TokenContext";

const models = {
  "flux-schnell": {
    name: "Basic",
    description: "Fast generation with basic quality",
    tokenCost: 1,
    icon: "⚡",
  },
  "flux-dev": {
    name: "Premium",
    description: "High quality with fast turnaround",
    tokenCost: 2,
    icon: "🚀",
  },
  "flux-1.1-pro-ultra": {
    name: "Ultra",
    description: "Maximum quality with advanced features",
    tokenCost: 3,
    icon: "✨",
  },
} as const;

type ModelKey = keyof typeof models;

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
  retro: {
    name: "Retro",
    prompt:
      "retro style, vintage aesthetics, 80s design, synthwave, nostalgic colors",
    icon: "📻",
  },
  minimalist: {
    name: "Minimalist",
    prompt:
      "minimalist style, clean design, simple shapes, limited color palette, modern art",
    icon: "⬜",
  },
  pixel: {
    name: "Pixel Art",
    prompt:
      "pixel art style, 16-bit graphics, retro game aesthetic, pixelated details, video game art",
    icon: "👾",
  },
  steampunk: {
    name: "Steampunk",
    prompt:
      "steampunk aesthetic, victorian sci-fi, brass and copper tones, mechanical details, steam-powered machinery",
    icon: "⚙️",
  },
  abstract: {
    name: "Abstract",
    prompt:
      "abstract art, non-representational, geometric shapes, bold composition, modern abstract expressionism",
    icon: "🎯",
  },
} as const;

type StyleKey = keyof typeof styles;

const examplePrompts = [
  "A majestic dragon soaring through a sunset sky",
  "A cozy cafe interior with warm lighting and vintage decor",
  "A mystical forest with glowing mushrooms and fairy lights",
  "A futuristic cityscape with flying cars and neon signs",
  "An underwater palace with mermaids and bioluminescent creatures",
  "A steampunk-inspired train station with brass and copper details",
  "A floating island paradise with waterfalls and rainbow bridges",
  "A magical library with floating books and starlit ceiling",
  "A crystal cave with geometric formations and ethereal light",
  "A cyberpunk street market at night with holographic displays",
];

export default function Home() {
  const { user } = useUser();
  const { tokens, useTokens: spendTokens } = useTokens();
  const [selectedModel, setSelectedModel] = useState<ModelKey>("flux-dev");
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [selectedStyles, setSelectedStyles] = useState<Set<StyleKey>>(
    new Set<StyleKey>()
  );
  const router = useRouter();

  const enhancePrompt = async (generatedImage: string) => {
    //download image
    // setIsEnhancing(true);
    // window.open(generatedImage, "_blank");
  };

  // Enhance prompt when user stops typing or changes style
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prompt) {
        enhancePrompt(prompt);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [prompt, selectedStyles]);

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

    // Calculate token cost but don't spend yet
    const tokenCost = models[selectedModel].tokenCost;
    console.log("Checking token balance:", {
      cost: tokenCost,
      currentBalance: tokens,
    });

    // Check if user has enough tokens without spending them
    if (tokens < tokenCost) {
      toast.error("Insufficient tokens");
      router.push("/tokens");
      return;
    }

    // Combine user prompt with selected style prompts
    let finalPrompt = prompt;
    if (selectedStyles.size > 0) {
      const stylePrompts = Array.from(selectedStyles)
        .map((style) => styles[style].prompt)
        .join(", ");
      finalPrompt = `${finalPrompt}, ${stylePrompts}`;
    }

    console.log("Generating image with:", {
      prompt: finalPrompt,
      model: selectedModel,
      useEnhanced,
      enhancedPrompt,
    });

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Only spend tokens after successful generation
      const success = await spendTokens(tokenCost);
      if (!success) {
        throw new Error("Failed to process token payment");
      }

      const type = typeof data.imageUrl;
      console.log("Image generated successfully:", data.imageUrl);
      if (type === "string") {
        setGeneratedImage(data.imageUrl);
      } else {
        setGeneratedImage(data.imageUrl[0]);
      }

      // Save to Supabase

      const { error: supabaseError } = await supabase.from("images").insert([
        {
          prompt: finalPrompt,
          image_url: data.imageUrl[0],
          user_id: user.id,
          model: selectedModel,
          categories: Array.from(selectedStyles).map(
            (style) => styles[style].name
          ),
        },
      ]);

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        throw supabaseError;
      }

      toast.success("Image generated and saved successfully!");
    } catch (error) {
      console.error("Generation error:", {
        message: error.message,
        stack: error.stack,
      });
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * examplePrompts.length);
    setPrompt(examplePrompts[randomIndex]);
  };

  return (
    <div className="min-h-screen  bg-gradient-to-b from-dark-900 to-dark-950 text-white">
      <Toaster position="top-center" />

      {/* Hero Section */}
      <div className="relative overflow-hidden  pt-16 pb-32">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-medium tracking-tight  sm:text-5xl lg:text-6xl">
              Create stunning images
              <span className="block text-2xl sm:text-3xl text-gray-500 mt-4 font-normal">
                with the power of AI
              </span>
            </h1>
          </div>

          {/* Main Creation Area */}
          <div className="mt-16">
            <div className="border border-primary-500/10 p-8 bg-dark-800/50 backdrop-blur-sm rounded-3xl rounded-2xl shadow-sm  p-8">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Model Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Select Model
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(models).map(([key, model]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedModel(key as ModelKey)}
                        className={`p-4 rounded-xl border transition-all duration-200 text-left
                          ${
                            selectedModel === key
                              ? "border-primary-500 bg-primary-500/10 shadow-glow"
                              : "border-primary-500/10 hover:border-primary-500/20"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{model.icon}</span>
                          <span className="text-sm font-medium text-primary-300">
                            {model.tokenCost} 🪙
                          </span>
                        </div>
                        <h3 className="font-medium text-primary-100">
                          {model.name}
                        </h3>
                        <p className="text-sm text-primary-300/70">
                          {model.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selector */}
                <div>
                  <label className="block text-base font-medium  mb-3">
                    Choose Styles (Optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(styles) as StyleKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          const newStyles = new Set<StyleKey>(selectedStyles);
                          if (newStyles.has(key)) {
                            newStyles.delete(key);
                          } else {
                            newStyles.add(key);
                          }
                          setSelectedStyles(newStyles);
                        }}
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

                {/* Prompt Input */}
                <div>
                  <label
                    htmlFor="prompt"
                    className="block text-base font-medium  mb-3"
                  >
                    What would you like to create?
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="block w-full px-4 py-3 pr-48 rounded-xl bg-gray-50 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                        placeholder="A serene Japanese garden with cherry blossoms..."
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                        <button
                          onClick={generateRandomPrompt}
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                        >
                          Random 🎲
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
                  </div>

                  {/* Example Prompts */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-sm text-gray-500">Try:</span>
                    {[
                      "A majestic dragon",
                      "A cozy cafe interior",
                      "A mystical forest",
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
                          <div className="flex space-x-4">
                            <button
                              onClick={() => (window.location.href = "/")}
                              className="px-6 py-2.5 bg-black text-white rounded-full hover:bg-gray-900 transition-colors duration-200 text-sm font-medium"
                            >
                              Create New
                            </button>
                            <button
                              onClick={() => enhancePrompt(generatedImage)}
                              className="px-6 py-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                            >
                              Download
                            </button>
                          </div>
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
            className=" hover:text-black transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
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
