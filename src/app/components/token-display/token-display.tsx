"use client";

import { useTokens } from "@/contexts/TokenContext";
import Link from "next/link";

export default function TokenDisplay() {
    const { tokens, isLoading } = useTokens();

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-primary-500/20 animate-pulse" />
                <div className="h-4 w-16 bg-primary-500/20 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <Link
            href="/tokens"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-colors duration-200"
        >
            <span className="text-xl">🪙</span>
            <span className="font-medium text-primary-300">{tokens}</span>
        </Link>
    );
} 