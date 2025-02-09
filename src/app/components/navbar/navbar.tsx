"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/contexts/UserContext";
import TokenDisplay from "../token-display/token-display";

export default function Navbar() {
  const { user, profile } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-dark-900/95 shadow-lg sticky top-0 z-50 backdrop-blur-lg border-b border-primary-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            <Link href="/" className="flex items-center">
              <div className="flex items-center">
                <span className="text-primary-300">Oli</span>
                <span className="text-primary-400">Canvas</span>
                <span className="text-xs ml-1 text-primary-500 font-normal">
                  AI
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link
              href="/gallery"
              className="text-primary-300/70 hover:text-primary-300 transition-colors duration-200"
            >
              Gallery
            </Link>
            <Link
              href="/image-to-image"
              className="text-primary-300/70 hover:text-primary-300 transition-colors duration-200"
            >
              Image to Image
            </Link>
            <Link
              href="/furniture-transform"
              className="text-primary-300/70 hover:text-primary-300 transition-colors duration-200"
            >
              Furniture Transform
            </Link>
            {user ? (
              <>
                <Link
                  href="/my-creations"
                  className="text-primary-300/70 hover:text-primary-300 transition-colors duration-200"
                >
                  My Creations
                </Link>
                <TokenDisplay />
                <button
                  onClick={handleSignOut}
                  className="text-primary-300/70 hover:text-primary-300 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary-300 hover:text-primary-400 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } sm:hidden absolute w-full bg-dark-800/95 backdrop-blur-lg border-b border-primary-500/10`}
      >
        <div className="px-4 pt-2 pb-3 space-y-2">
          <Link
            href="/gallery"
            className="block px-3 py-2 rounded-lg text-primary-300/70 hover:text-primary-300 hover:bg-primary-500/10 transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Gallery
          </Link>
          <Link
            href="/image-to-image"
            className="block px-3 py-2 rounded-lg text-primary-300/70 hover:text-primary-300 hover:bg-primary-500/10 transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Image to Image
          </Link>
          <Link
            href="/furniture-transform"
            className="block px-3 py-2 rounded-lg text-primary-300/70 hover:text-primary-300 hover:bg-primary-500/10 transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Furniture Transform
          </Link>
          {user && (
            <Link
              href="/my-creations"
              className="block px-3 py-2 rounded-lg text-primary-300/70 hover:text-primary-300 hover:bg-primary-500/10 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              My Creations
            </Link>
          )}
          {user ? (
            <>
              <div className="px-3 py-2">
                <TokenDisplay />
              </div>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-primary-300/70 hover:text-primary-300 hover:bg-primary-500/10 transition-all duration-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="block px-3 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-200"
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
