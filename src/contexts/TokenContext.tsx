"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "./UserContext";

interface TokenContextType {
    tokens: number;
    isLoading: boolean;
    refreshTokens: () => Promise<void>;
    useTokens: (amount: number) => Promise<boolean>;
    addTokens: (amount: number) => Promise<boolean>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
    const [tokens, setTokens] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();
    const userId = user?.id;

    const refreshTokens = useCallback(async () => {
        if (!userId) {
            setTokens(0);
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("tkn_qtt")
                .eq("id", userId)
                .single();

            if (error) throw error;
            setTokens(data.tkn_qtt || 0);
        } catch (error) {
            console.error("Error fetching tokens:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const useTokens = useCallback(async (amount: number): Promise<boolean> => {
        if (!userId || tokens < amount) return false;

        try {
            const { error } = await supabase
                .from("profiles")
                .update({ tkn_qtt: tokens - amount })
                .eq("id", userId);

            if (error) throw error;

            setTokens(prev => prev - amount);
            return true;
        } catch (error) {
            console.error("Error using tokens:", error);
            return false;
        }
    }, [userId, tokens]);

    const addTokens = useCallback(async (amount: number): Promise<boolean> => {
        if (!userId) return false;

        try {
            const { error } = await supabase
                .from("profiles")
                .update({ tkn_qtt: tokens + amount })
                .eq("id", userId);

            if (error) throw error;

            setTokens(prev => prev + amount);
            return true;
        } catch (error) {
            console.error("Error adding tokens:", error);
            return false;
        }
    }, [userId, tokens]);

    useEffect(() => {
        let mounted = true;

        if (userId) {
            // Add a small delay to prevent rapid successive calls
            const timeoutId = setTimeout(() => {
                if (mounted) {
                    refreshTokens();
                }
            }, 100);

            return () => {
                mounted = false;
                clearTimeout(timeoutId);
            };
        } else {
            setTokens(0);
            setIsLoading(false);
        }
    }, [userId, refreshTokens]);

    const value = {
        tokens,
        isLoading,
        refreshTokens,
        useTokens,
        addTokens,
    };

    return (
        <TokenContext.Provider value={value}>
            {children}
        </TokenContext.Provider>
    );
}

export function useTokens() {
    const context = useContext(TokenContext);
    if (context === undefined) {
        throw new Error("useTokens must be used within a TokenProvider");
    }
    return context;
}
