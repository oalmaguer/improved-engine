"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";
import toast, { Toaster } from "react-hot-toast";
import ImageLightbox from "@/app/components/image-lightbox/image-lightbox";
import Image from "next/image";
import Card from "../components/card/card";

const furnitureStyles = {
  futuristic: {
    name: "Futuristic",
    prompt:
      "futuristic interior design, cyberpunk style, high-tech furniture, neon accents, sleek metallic surfaces, smart home integration, same room layout",
    icon: "🚀",
  },
  ps1: {
    name: "PS1 Style",
    prompt:
      "PlayStation 1 era 3D graphics, low-poly aesthetic, pixelated textures, retro gaming style, chunky polygons, limited color palette, jagged edges, same room layout, nostalgic 90s video game look",
    icon: "🎮",
  },
  vaporwave: {
    name: "Vaporwave",
    prompt:
      "vaporwave aesthetic, retro 80s style, pink and blue neon lighting, glowing grid patterns, synthwave interior, vintage computer graphics, same room layout",
    icon: "💾",
  },
  minecraft: {
    name: "Minecraft",
    prompt:
      "Minecraft style room, blocky voxel graphics, pixelated textures, cube-based furniture, Minecraft game aesthetic, same room layout",
    icon: "⛏️",
  },
  cyberpunk: {
    name: "Cyberpunk",
    prompt:
      "cyberpunk interior design, neon-lit room, holographic displays, high-tech cyberpunk furniture, dark metallic surfaces with glowing neon accents, retro-futuristic aesthetic, same room layout, blade runner style",
    icon: "🤖",
  },
  steampunk: {
    name: "Steampunk",
    prompt:
      "steampunk interior, brass and copper machinery, Victorian-era furniture with mechanical elements, steam-powered devices, vintage industrial aesthetic, wooden and metal details, same room layout",
    icon: "⚙️",
  },
  medieval: {
    name: "Medieval",
    prompt:
      "medieval castle interior, stone walls, wooden beams, iron chandeliers, medieval furniture, tapestries, rustic medieval aesthetic, torch lighting, same room layout",
    icon: "⚔️",
  },
  underwater: {
    name: "Underwater",
    prompt:
      "underwater palace interior, aquatic design elements, coral decorations, bioluminescent lighting, oceanic color palette, submerged furniture style, same room layout",
    icon: "🌊",
  },
  warcraft: {
    name: "Warcraft",
    prompt:
      "World of Warcraft inspired interior, fantasy furniture, ornate warcraft decorations, magical crystals, alliance/horde banners, epic fantasy aesthetic, glowing runes, same room layout",
    icon: "🐉",
  },
  minimalist: {
    name: "Minimalist",
    prompt:
      "minimalist interior design, clean lines, neutral colors, functional furniture, zen atmosphere, uncluttered space, same room layout",
    icon: "⬜",
  },
  industrial: {
    name: "Industrial",
    prompt:
      "industrial style interior, exposed brick walls, metal fixtures, raw materials, urban loft aesthetic, same room layout",
    icon: "🏭",
  },
  jungle: {
    name: "Jungle",
    prompt:
      "tropical jungle interior, lush indoor plants, natural wood furniture, vine-covered walls, exotic tropical decor, earthy color palette, same room layout",
    icon: "🌴",
  },
  scandinavian: {
    name: "Scandinavian",
    prompt:
      "scandinavian interior design, light wood furniture, white walls, cozy textiles, natural light, hygge atmosphere, same room layout",
    icon: "🌲",
  },
  luxury: {
    name: "Luxury",
    prompt:
      "luxury interior design, high-end furniture, crystal chandeliers, marble surfaces, gold accents, opulent decor, same room layout",
    icon: "👑",
  },
  space: {
    name: "Space Station",
    prompt:
      "space station interior, zero gravity design, metallic surfaces, viewing windows to space, sci-fi control panels, astronaut quarters style, same room layout",
    icon: "🛸",
  },
  starwars: {
    name: "Star Wars",
    prompt:
      "Star Wars inspired interior design, sci-fi furniture like from Coruscant apartments, sleek and futuristic with Star Wars aesthetic, elegant space-age design, chrome and white surfaces, subtle Star Wars themed decor",
    icon: "⭐",
  },
  marvel: {
    name: "Marvel HQ",
    prompt:
      "Marvel superhero headquarters style, high-tech Avengers compound interior, modern superhero aesthetic, Stark Industries inspired design, advanced technology integrated into furniture, sleek and powerful appearance",
    icon: "⚡",
  },
  gotham: {
    name: "Gotham",
    prompt:
      "Batman's Gotham City style, dark and gothic architecture, art deco elements, luxury mixed with darkness, dramatic lighting, Wayne Manor meets Batcave aesthetic, elegant yet mysterious",
    icon: "🦇",
  },
  mandalorian: {
    name: "Mandalorian",
    prompt:
      "Star Wars Mandalorian style interior, mix of rugged and high-tech, beskar steel aesthetic, industrial sci-fi design, weathered metallic surfaces, warm lighting with sci-fi elements",
    icon: "🪐",
  },
} as const;

type StyleKey = keyof typeof furnitureStyles;

const models = {
  "flux-dev": {
    name: "Standard",
    description: "High quality generation with good speed",
    tokenCost: 2,
    icon: "✨",
  },
} as const;

type ModelKey = keyof typeof models;

export default function FurnitureTransform() {
  const { user } = useUser();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StyleKey | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelKey>("flux-dev");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [generatedImage, setGeneratedImage] = useState<string>("");

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

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to transform furniture");
      router.push("/auth");
      return;
    }

    if (!selectedImage || !selectedStyle) {
      toast.error("Please select an image and a style");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("prompt", furnitureStyles[selectedStyle].prompt);
      formData.append("model", selectedModel);

      const response = await fetch("/api/transform-furniture", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to transform room");
      }

      const data = await response.json();
      console.log("API Response:", data); // For debugging

      if (
        !data.imageUrl ||
        (Array.isArray(data.imageUrl) && data.imageUrl.length === 0)
      ) {
        throw new Error("No image was generated");
      }

      // Handle both array and single string responses
      const imageUrl = Array.isArray(data.imageUrl)
        ? data.imageUrl[0]
        : data.imageUrl;
      setGeneratedImage(imageUrl);

      // Save to Supabase
      const { error: supabaseError } = await supabase.from("images").insert([
        {
          prompt: furnitureStyles[selectedStyle].prompt,
          image_url: imageUrl,
          user_id: user.id,
          categories: [furnitureStyles[selectedStyle].name],
        },
      ]);

      if (supabaseError) throw supabaseError;
      toast.success("Room transformed successfully!");
    } catch (error) {
      console.error("Error transforming room:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to transform room"
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
            Transform Your Space
          </h1>
          <p className="text-lg text-primary-300/70">
            Reimagine your room with different interior design styles
          </p>
        </div>

        <div className="space-y-8">
          {/* Add Model Selection before the image upload section */}
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-primary-500/10 p-8">
            <h3 className="text-lg font-medium text-primary-100 mb-4">
              Choose Quality Level
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(Object.keys(models) as ModelKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedModel(key)}
                  className={`p-4 rounded-xl border transition-all duration-200 text-left
                    ${
                      selectedModel === key
                        ? "border-primary-500 bg-primary-500/10 shadow-glow"
                        : "border-primary-500/10 hover:border-primary-500/20"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{models[key].icon}</span>
                    <span className="text-sm font-medium text-primary-300">
                      {models[key].tokenCost} 🪙
                    </span>
                  </div>
                  <h3 className="font-medium text-primary-100">
                    {models[key].name}
                  </h3>
                  <p className="text-sm text-primary-300/70">
                    {models[key].description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Original upload and style selection section */}
          <div className="bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-primary-500/10 p-8">
            {/* Image Upload Section */}
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
                          Click to upload your room photo
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

            {/* Style Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-primary-100 mb-4">
                Choose a Style
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(Object.keys(furnitureStyles) as StyleKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStyle(key)}
                    className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 
                        ${
                          selectedStyle === key
                            ? "bg-primary-500 text-white shadow-glow"
                            : "bg-primary-500/10 text-primary-300 hover:bg-primary-500/20"
                        }`}
                  >
                    <span className="mr-2">{furnitureStyles[key].icon}</span>
                    {furnitureStyles[key].name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          {generatedImage && (
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-primary-500/10 p-8">
              <h3 className="text-lg font-medium text-primary-100 mb-4">
                Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Original Image */}
                <div>
                  <h4 className="text-sm text-primary-300/70 mb-2">
                    Original Room
                  </h4>
                  <div className="relative w-full max-h-[500px] rounded-2xl overflow-hidden">
                    <ImageLightbox
                      src={imagePreview}
                      alt="Original room"
                      className="w-full h-full object-contain"
                    >
                      <Image
                        src={imagePreview}
                        alt="Original room"
                        width={500}
                        height={500}
                        className="w-full h-full object-contain"
                      />
                    </ImageLightbox>
                  </div>
                </div>

                {/* Generated Image */}
                <div>
                  <h4 className="text-sm text-primary-300/70 mb-2">
                    Transformed Room
                  </h4>
                  <div className="relative w-full max-h-[500px] rounded-2xl overflow-hidden">
                    <Image
                      src={generatedImage}
                      alt="Transformed room"
                      width={500}
                      height={500}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Download and Style Details */}
              <div className="mt-6 space-y-6">
                {/* Download buttons */}
                <div className="flex justify-end space-x-3">
                  <a
                    href={imagePreview}
                    download="original-room.jpg"
                    className="inline-flex items-center px-4 py-2 bg-dark-800 hover:bg-dark-700 text-primary-100 rounded-xl transition-colors duration-200 text-sm font-medium border border-primary-500/10"
                    onClick={(e) => {
                      e.preventDefault();
                      const link = document.createElement("a");
                      link.href = imagePreview;
                      link.download = "original-room.jpg";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Original
                  </a>
                  <a
                    href={generatedImage}
                    download="transformed-room.jpg"
                    className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors duration-200 text-sm font-medium shadow-glow hover:shadow-glow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      const link = document.createElement("a");
                      link.href = generatedImage;
                      link.download = "transformed-room.jpg";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Result
                  </a>
                </div>

                {/* Style details */}
                <div className="p-4 bg-dark-800/50 rounded-xl border border-primary-500/10">
                  <h4 className="text-sm font-medium text-primary-100 mb-2">
                    Applied Style
                  </h4>
                  <p className="text-sm text-primary-300/70">
                    {furnitureStyles[selectedStyle!].prompt}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transform Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedImage || !selectedStyle}
            className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200
                            ${
                              isLoading || !selectedImage || !selectedStyle
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
              "Transform Room"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
