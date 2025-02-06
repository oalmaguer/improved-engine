"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";
import toast, { Toaster } from "react-hot-toast";

const furnitureStyles = {
    futuristic: {
        name: "Futuristic",
        prompt: "futuristic interior design, cyberpunk style, high-tech furniture, neon accents, sleek metallic surfaces, smart home integration, same room layout",
        icon: "🚀",
    },
    cyberpunk: {
        name: "Cyberpunk",
        prompt: "cyberpunk interior design, neon-lit room, holographic displays, high-tech cyberpunk furniture, dark metallic surfaces with glowing neon accents, retro-futuristic aesthetic, same room layout, blade runner style",
        icon: "🤖",
    },
    medieval: {
        name: "Medieval",
        prompt: "medieval castle interior, stone walls, wooden beams, iron chandeliers, medieval furniture, tapestries, rustic medieval aesthetic, torch lighting, same room layout",
        icon: "⚔️",
    },
    warcraft: {
        name: "Warcraft",
        prompt: "World of Warcraft inspired interior, fantasy furniture, ornate warcraft decorations, magical crystals, alliance/horde banners, epic fantasy aesthetic, glowing runes, same room layout",
        icon: "🐉",
    },
    minimalist: {
        name: "Minimalist",
        prompt: "minimalist interior design, clean lines, neutral colors, functional furniture, zen atmosphere, uncluttered space, same room layout",
        icon: "⬜",
    },
    industrial: {
        name: "Industrial",
        prompt: "industrial style interior, exposed brick walls, metal fixtures, raw materials, urban loft aesthetic, same room layout",
        icon: "🏭",
    },
    scandinavian: {
        name: "Scandinavian",
        prompt: "scandinavian interior design, light wood furniture, white walls, cozy textiles, natural light, hygge atmosphere, same room layout",
        icon: "🌲",
    },
    luxury: {
        name: "Luxury",
        prompt: "luxury interior design, high-end furniture, crystal chandeliers, marble surfaces, gold accents, opulent decor, same room layout",
        icon: "👑",
    }
} as const;

type StyleKey = keyof typeof furnitureStyles;

export default function FurnitureTransform() {
    const { user } = useUser();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState<StyleKey | null>(null);
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

            const response = await fetch("/api/image-to-image", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to transform room");
            }

            const data = await response.json();
            console.log("API Response:", data); // For debugging

            if (!data.imageUrl || (Array.isArray(data.imageUrl) && data.imageUrl.length === 0)) {
                throw new Error("No image was generated");
            }

            // Handle both array and single string responses
            const imageUrl = Array.isArray(data.imageUrl) ? data.imageUrl[0] : data.imageUrl;
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
            toast.error(error instanceof Error ? error.message : "Failed to transform room");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 py-16 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-medium text-primary-100 mb-4">Transform Your Space</h1>
                    <p className="text-lg text-primary-300/70">
                        Reimagine your room with different interior design styles
                    </p>
                </div>

                <div className="space-y-8">
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
                                                <svg className="w-12 h-12 text-primary-500/70 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                            <h3 className="text-lg font-medium text-primary-100 mb-4">Choose a Style</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {(Object.keys(furnitureStyles) as StyleKey[]).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedStyle(key)}
                                        className={`flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 
                        ${selectedStyle === key
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
                            <h3 className="text-lg font-medium text-primary-100 mb-4">Room Transformation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Original Image */}
                                <div>
                                    <h4 className="text-sm text-primary-300/70 mb-2">Original Room</h4>
                                    <div className="relative aspect-square rounded-2xl overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Original room"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Transformed Image */}
                                <div>
                                    <h4 className="text-sm text-primary-300/70 mb-2">Transformed Room ({furnitureStyles[selectedStyle!].name})</h4>
                                    <div className="relative aspect-square rounded-2xl overflow-hidden">
                                        <img
                                            src={generatedImage}
                                            alt="Transformed room"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Download buttons */}
                            <div className="mt-6 flex justify-end space-x-4">
                                <a
                                    href={imagePreview}
                                    download="original-room.jpg"
                                    className="px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full hover:bg-primary-500/20 transition-colors duration-200 text-sm font-medium border border-primary-500/20"
                                >
                                    Download Original
                                </a>
                                <a
                                    href={generatedImage}
                                    download="transformed-room.jpg"
                                    className="px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full hover:bg-primary-500/20 transition-colors duration-200 text-sm font-medium border border-primary-500/20"
                                >
                                    Download Transformed
                                </a>
                            </div>

                            {/* Style details */}
                            <div className="mt-6 p-4 bg-primary-500/5 rounded-xl border border-primary-500/10">
                                <h4 className="text-sm font-medium text-primary-100 mb-2">Applied Style</h4>
                                <p className="text-sm text-primary-300/70">
                                    {furnitureStyles[selectedStyle!].prompt}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Transform Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedImage || !selectedStyle}
                        className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200
                            ${isLoading || !selectedImage || !selectedStyle
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