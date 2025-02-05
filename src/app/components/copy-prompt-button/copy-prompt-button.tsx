"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface CopyPromptButtonProps {
    prompt: string;
    className?: string;
}

export default function CopyPromptButton({ prompt, className = "" }: CopyPromptButtonProps) {
    const [copying, setCopying] = useState(false);

    const handleCopy = async () => {
        setCopying(true);
        try {
            await navigator.clipboard.writeText(prompt);
            toast.success("Prompt copied to clipboard");
        } catch (error) {
            toast.error("Failed to copy prompt");
            console.error("Copy failed:", error);
        } finally {
            setCopying(false);
        }
    };

    return (
        <button
            onClick={handleCopy}
            disabled={copying}
            className={`inline-flex items-center space-x-1 text-xs transition-colors duration-200 ${className}`}
            title="Copy prompt"
        >
            {copying ? (
                <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Copying...</span>
                </>
            ) : (
                <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy Prompt</span>
                </>
            )}
        </button>
    );
}
