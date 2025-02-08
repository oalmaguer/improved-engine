"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import ImageLightbox from "../components/image-lightbox/image-lightbox";
import Image from "next/image";

const styles = {
  modern: {
    name: "Modern",
    description: "Clean lines, minimalist design, contemporary furniture",
  },
  scandinavian: {
    name: "Scandinavian",
    description: "Light woods, neutral colors, functional and cozy",
  },
  industrial: {
    name: "Industrial",
    description: "Raw materials, exposed elements, urban aesthetic",
  },
  bohemian: {
    name: "Bohemian",
    description: "Eclectic patterns, natural textures, artistic vibe",
  },
  traditional: {
    name: "Traditional",
    description: "Classic design, rich textures, elegant furniture",
  },
  coastal: {
    name: "Coastal",
    description: "Beach-inspired, light and airy, natural elements",
  },
} as const;

type StyleKey = keyof typeof styles;

export default function TransformFurniture() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<StyleKey | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);

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

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImagePreview(imageUrl);
  };

  const transformFurniture = async () => {
    if (!user) {
      toast.error("Please sign in to transform furniture");
      router.push("/auth");
      return;
    }

    if (!selectedImage || !selectedStyle) {
      toast.error("Please select an image and style");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("style", styles[selectedStyle].name);
      if (prompt) formData.append("prompt", prompt);

      const response = await fetch("/api/transform-furniture", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transform furniture");
      }

      const data = await response.json();
      setGeneratedImage(
        Array.isArray(data.imageUrl) ? data.imageUrl[0] : data.imageUrl
      );

      // Save to Supabase
      const { error } = await supabase.from("images").insert([
        {
          prompt: `${styles[selectedStyle].name} style transformation${
            prompt ? `: ${prompt}` : ""
          }`,
          image_url: data.imageUrl[0],
          user_id: user.id,
          categories: ["Furniture", styles[selectedStyle].name],
        },
      ]);

      if (error) throw error;
      toast.success("Room transformed successfully!");
    } catch (error) {
      toast.error("Failed to transform room");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Transform Your Room
          </h1>
          <p className="text-lg text-gray-600">
            Upload a photo of your room and transform it into different styles
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Image Upload */}
          <div className="mb-8">
            <label className="block text-base font-medium text-gray-900 mb-3">
              Upload Room Photo
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              <div className="text-center w-full">
                {imagePreview ? (
                  // Preview of uploaded image
                  <div className="mb-4">
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Room preview"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview("");
                      }}
                      className="mt-4 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  // Upload prompt when no image is selected
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label className="relative cursor-pointer rounded-md bg-white font-semibold text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 hover:text-gray-800">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Style Selection */}
          <div className="mb-8">
            <label className="block text-base font-medium text-gray-900 mb-3">
              Choose Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(styles).map(([key, style]) => (
                <button
                  key={key}
                  onClick={() => setSelectedStyle(key as StyleKey)}
                  className={`p-4 rounded-xl text-left transition-all duration-200 ${
                    selectedStyle === key
                      ? "bg-black text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <h3 className="font-medium mb-1">{style.name}</h3>
                  <p className="text-sm opacity-80">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Prompt */}
          <div className="mb-8">
            <label className="block text-base font-medium text-gray-900 mb-3">
              Additional Details (Optional)
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black"
              placeholder="Add specific requirements..."
            />
          </div>

          {/* Transform Button */}
          <button
            onClick={transformFurniture}
            disabled={isLoading || !selectedImage || !selectedStyle}
            className="w-full py-3 px-4 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-300"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Transforming...</span>
              </div>
            ) : (
              "Transform Room"
            )}
          </button>

          {/* Side by Side Comparison */}
          {generatedImage && (
            <div className="mt-8">
              <h3 className="text-xl font-medium mb-4">Results</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Original Image */}
                <div>
                  <h4 className="text-lg font-medium mb-2">Original Room</h4>
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Original room"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Generated Image */}
                <div>
                  <h4 className="text-lg font-medium mb-2">Transformed Room</h4>
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={generatedImage}
                      alt="Transformed room"
                      className="w-full h-full"
                      width={800}
                      height={800}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Selection */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Example images */}
            {["/image1.jpg", "/image2.jpg", "/image3.jpg"].map((image) => (
              <div key={image} onClick={() => handleImageSelect(image)}>
                <Image
                  src={image}
                  alt="Furniture"
                  width={200}
                  height={200}
                  className="cursor-pointer rounded-lg hover:opacity-80"
                />
              </div>
            ))}
          </div>

          {/* Original Image Preview with Lightbox */}
          {selectedImagePreview && (
            <div className="mt-8">
              <h2 className="text-xl font-medium mb-2">
                Original Image Preview
              </h2>
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  width={200}
                  height={200}
                  src={selectedImagePreview}
                  alt="Selected Furniture"
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
