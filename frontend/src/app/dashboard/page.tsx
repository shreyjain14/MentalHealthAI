"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, logoutUser, shouldShowMoodPopup } from "@/utils/auth";
import Navbar from "@/components/Navbar";
import MoodPopup from "@/components/MoodPopup";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [showMoodPopup, setShowMoodPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated, if not redirect to login
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Try to get username from localStorage
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "User");

    // Check if we should show the mood popup
    const shouldShow = shouldShowMoodPopup();
    setShowMoodPopup(shouldShow);

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const handleCloseMoodPopup = () => {
    setShowMoodPopup(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {showMoodPopup && <MoodPopup onClose={handleCloseMoodPopup} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {username}! This is your MindCare dashboard. Here you
            can access all your mental health resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="bg-surface rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Your Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              View and edit your personal information, preferences, and mental
              health profile.
            </p>
            <div className="mt-4">
              <Link
                href="/profile"
                className="inline-block w-full px-4 py-2 bg-pink-600 text-white text-center rounded-md hover:bg-pink-700 transition-colors"
              >
                Go to Profile
              </Link>
            </div>
          </div>

          {/* Chat Bot Card */}
          <div className="bg-surface rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              AI Therapy Chat
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Talk to our AI therapist about your feelings and get personalized
              support and guidance.
            </p>
            <div className="mt-4">
              <Link
                href="/chat"
                className="inline-block w-full px-4 py-2 bg-pink-600 text-white text-center rounded-md hover:bg-pink-700 transition-colors"
              >
                Start Chatting
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
