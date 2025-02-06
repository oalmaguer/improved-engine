"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";

export default function Navbar() {
  const { user, profile } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-dark-900/95 shadow-lg sticky top-0 z-50 backdrop-blur-lg border-b border-primary-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-lg font-medium text-primary-100 hover:text-primary-50 flex items-center transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <span className="text-primary-300">Dream</span>
                <span className="text-primary-400">Canvas</span>
                <span className="text-xs ml-1 text-primary-500 font-normal">
                  AI
                </span>
                {user && profile?.avatar_url && (
                  <div className="ml-3 h-6 w-6 rounded-full overflow-hidden">
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "User avatar"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm text-primary-400/70 hover:text-primary-300 transition-colors duration-200"
              >
                Create
              </Link>
              <Link
                href="/image-to-image"
                className="text-sm text-primary-400/70 hover:text-primary-300 transition-colors duration-200"
              >
                Transform Image
              </Link>
              <Link
                href="/furniture-transform"
                className="text-sm text-primary-400/70 hover:text-primary-300 transition-colors duration-200"
              >
                Transform Room
              </Link>
              <Link
                href="/gallery"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200"
              >
                Browse
              </Link>
              {user && (
                <Link
                  href="/my-creations"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200"
                >
                  My Creations
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-primary-500 hover:text-primary-100 hover:bg-primary-100/50 transition-colors duration-200 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-6">
                <Link
                  href="/profile"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-primary-100 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-sm font-medium text-primary-100 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isMenuOpen ? "block" : "hidden"
          } md:hidden absolute top-16 inset-x-0 bg-white shadow-lg border-t border-gray-100`}
      >
        <div className="px-4 py-3 space-y-1">
          <Link
            href="/"
            className="block px-3 py-2.5 text-sm text-primary-400/70 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Create
          </Link>
          <Link
            href="/image-to-image"
            className="block px-3 py-2.5 text-sm text-primary-400/70 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Transform Image
          </Link>
          <Link
            href="/furniture-transform"
            className="block px-3 py-2.5 text-sm text-primary-400/70 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Transform Room
          </Link>
          <Link
            href="/gallery"
            className="block px-3 py-2.5 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-50 rounded-lg transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Gallery
          </Link>
          {user && (
            <Link
              href="/my-creations"
              className="block px-3 py-2.5 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              My Creations
            </Link>
          )}
          {user ? (
            <>
              <Link
                href="/profile"
                className="block px-3 py-2.5 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2.5 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-50 rounded-lg transition-colors duration-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="block px-3 py-2.5 text-sm text-primary-400 hover:text-primary-300 hover:bg-primary-50 rounded-lg transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
