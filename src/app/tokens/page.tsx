"use client";

import { useState } from "react";
import { useTokens } from "@/contexts/TokenContext";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const tokenPackages = [
    { amount: 10, price: 4.99, popular: false },
    { amount: 25, price: 9.99, popular: true },
    { amount: 50, price: 18.99, popular: false },
    { amount: 100, price: 34.99, popular: false },
] as const;

export default function TokensPage() {
    const { user } = useUser();
    const { tokens, addTokens } = useTokens();
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const handlePurchase = async (amount: number, price: number) => {
        if (!user) {
            toast.error("Please sign in to purchase tokens");
            router.push("/auth");
            return;
        }

        setIsProcessing(true);
        try {
            // Here you would integrate with your payment processor (Stripe, PayPal, etc.)
            // For now, we'll just simulate a successful purchase
            const success = await addTokens(amount);

            if (success) {
                toast.success(`Successfully purchased ${amount} tokens!`);
            } else {
                throw new Error("Failed to add tokens");
            }
        } catch (error) {
            toast.error("Failed to process purchase");
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950">
            <Toaster position="top-center" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-gradient mb-4">Get Tokens</h1>
                    <p className="text-lg text-primary-300/70 max-w-2xl mx-auto">
                        Purchase tokens to generate more amazing images
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                    {tokenPackages.map(({ amount, price, popular }) => (
                        <div
                            key={amount}
                            className={`relative bg-dark-800/50 backdrop-blur-sm rounded-3xl border transition-all duration-200 
                ${popular
                                    ? "border-primary-500 shadow-glow"
                                    : "border-primary-500/10 hover:border-primary-500/20"
                                }`}
                        >
                            {popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="p-6">
                                <div className="text-center mb-4">
                                    <div className="text-4xl mb-2">🪙</div>
                                    <div className="text-2xl font-medium text-primary-100">
                                        {amount} Tokens
                                    </div>
                                    <div className="text-3xl font-medium text-primary-300 mt-2">
                                        ${price}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handlePurchase(amount, price)}
                                    disabled={isProcessing}
                                    className={`w-full py-2 px-4 rounded-xl text-white font-medium transition-all duration-200
                    ${isProcessing
                                            ? "bg-primary-500/50 cursor-not-allowed"
                                            : "bg-primary-500 hover:bg-primary-600 shadow-glow hover:shadow-glow-lg"
                                        }`}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                            Processing...
                                        </div>
                                    ) : (
                                        "Purchase"
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-primary-300/70">
                        Current Balance: <span className="text-primary-300 font-medium">{tokens} Tokens</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
