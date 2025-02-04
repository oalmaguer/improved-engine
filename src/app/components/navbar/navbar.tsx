"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-xl font-bold text-gray-800 hover:text-blue-600 flex items-center"
            >
              <span className="text-blue-600">Dream</span>
              <span className="text-purple-600">Canvas</span>
              <span className="text-xs ml-1 text-gray-500">AI</span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Create
              </Link>
              <Link
                href="/gallery"
                className="text-gray-600 hover:text-blue-600"
              >
                Gallery
              </Link>
              {user && (
                <Link
                  href="/my-creations"
                  className="text-gray-600 hover:text-blue-600"
                >
                  My Creations
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
