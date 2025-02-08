"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function Sidebar() {
  const { user, profile } = useUser();
  const [showAllTools, setShowAllTools] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {/* Hamburger Icon */}
      <div className="md:hidden p-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-[240px] bg-[#1E3A8A] text-white transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0 md:block`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-blue-800">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold">F2AI</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="p-3">
          <nav className="space-y-1">
            <Link
              href="/"
              className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Home</span>
            </Link>

            <Link
              href="/image-to-image"
              className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Image to Image</span>
            </Link>

            <Link
              href="/transform-furniture"
              className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Transform Furniture</span>
            </Link>

            <Link
              href="/gallery"
              className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span>Gallery</span>
            </Link>

            {user && (
              <>
                <Link
                  href="/my-creations"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>My Creations</span>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile</span>
                </Link>
              </>
            )}

            {/* Hidden tools - will be shown when showAllTools is true */}
            {showAllTools && (
              <>
                <Link
                  href="/chat"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span>AI Chat</span>
                </Link>

                <Link
                  href="/video-generate"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>AI Video Generate</span>
                </Link>

                <Link
                  href="/voice-clone"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  <span>AI Voice Clone</span>
                </Link>

                <Link
                  href="/code-generate"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-blue-300 hover:bg-[#2A2A2A] rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  <span>AI Code Generate</span>
                </Link>
              </>
            )}
          </nav>

          {/* Chat Folders Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-medium text-gray-400">
                Chat Folders
              </span>
              <button className="text-gray-400 hover:text-white">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
            <nav className="space-y-1">
              <Link
                href="/my-code"
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-[#2A2A2A] rounded-lg"
              >
                <span>My Code</span>
                <span className="text-xs text-gray-500">48</span>
              </Link>
              <Link
                href="/dutopia"
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-[#2A2A2A] rounded-lg"
              >
                <span>Dutopia</span>
                <span className="text-xs text-gray-500">16</span>
              </Link>
              <Link
                href="/favorites"
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:bg-[#2A2A2A] rounded-lg"
              >
                <span>Favorites</span>
                <span className="text-xs text-gray-500">128</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Upgrade Banner */}
      </div>
    </>
  );
}
