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
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-8 border border-gray-700/50">
          <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-gray-300">
            Welcome back, {username}! This is your MindCare dashboard. Here you
            can access all your mental health resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="group bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 hover:border-primary/50 hover:bg-gray-800/50 transition-all duration-300 flex flex-col">
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-light transition-colors">
                Your Profile
              </h2>
              <p className="text-gray-300">
                View and edit your personal information, preferences, and mental
                health profile.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link
                href="/profile"
                className="inline-block w-full px-4 py-3 bg-pink-400/80 text-white text-center rounded-md hover:bg-pink-500 active:bg-pink-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-pink-500/25"
              >
                Go to Profile
              </Link>
            </div>
          </div>

          {/* Chat Bot Card */}
          <div className="group bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 hover:border-primary/50 hover:bg-gray-800/50 transition-all duration-300 flex flex-col">
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-light transition-colors">
                AI Therapy Chat
              </h2>
              <p className="text-gray-300">
                Talk to our AI therapist about your feelings and get personalized
                support and guidance.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link
                href="/chat"
                className="inline-block w-full px-4 py-3 bg-pink-400/80 text-white text-center rounded-md hover:bg-pink-500 active:bg-pink-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-pink-500/25"
              >
                Start Chatting
              </Link>
            </div>
          </div>

          {/* Sound Therapy Card */}
          <div className="group bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 hover:border-primary/50 hover:bg-gray-800/50 transition-all duration-300 flex flex-col">
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-light transition-colors">
                Sound Therapy
              </h2>
              <p className="text-gray-300">
                Relax and focus with ambient sounds, including nature sounds, white noise, and meditation bells.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link
                href="/sound-therapy"
                className="inline-block w-full px-4 py-3 bg-pink-400/80 text-white text-center rounded-md hover:bg-pink-500 active:bg-pink-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-pink-500/25"
              >
                Open Sound Therapy
              </Link>
            </div>
          </div>

          {/* Coping Methods Card */}
          <div className="group bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 hover:border-primary/50 hover:bg-gray-800/50 transition-all duration-300 flex flex-col">
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-light transition-colors">
                Coping Methods
              </h2>
              <p className="text-gray-300">
                View coping methods for different mental health conditions or
                generate your own if you cannot find any you like.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link
                href="/coping"
                className="inline-block w-full px-4 py-3 bg-pink-400/80 text-white text-center rounded-md hover:bg-pink-500 active:bg-pink-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-pink-500/25"
              >
                View Methods
              </Link>
            </div>
          </div>

          {/* Relaxation Card */}
          <div className="group bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 hover:border-primary/50 hover:bg-gray-800/50 transition-all duration-300 flex flex-col">
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-light transition-colors">
                Relaxation Techniques
              </h2>
              <p className="text-gray-300">
                View relaxation techniques for different mental health conditions
                or generate your own if you cannot find any you like.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link
                href="/relaxation"
                className="inline-block w-full px-4 py-3 bg-pink-400/80 text-white text-center rounded-md hover:bg-pink-500 active:bg-pink-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-pink-500/25"
              >
                View Techniques
              </Link>
            </div>
          </div>

          {/* Mood History Card */}
          <div className="group bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 hover:border-primary/50 hover:bg-gray-800/50 transition-all duration-300 flex flex-col">
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-light transition-colors">
                Mood History
              </h2>
              <p className="text-gray-300">
                View your mood history and see how your mood has changed over
                time.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link
                href="/mood-history"
                className="inline-block w-full px-4 py-3 bg-pink-400/80 text-white text-center rounded-md hover:bg-pink-500 active:bg-pink-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-pink-500/25"
              >
                View History
              </Link>
            </div>
          </div>

          {/* Resources Card */}
          <div className="group bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 hover:border-primary/50 hover:bg-gray-800/50 transition-all duration-300 flex flex-col">
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold text-white mb-4 group-hover:text-primary-light transition-colors">
                Resources
              </h2>
              <p className="text-gray-300">
                View resources for different mental health conditions or add new
                ones you think others will find helpful.
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link
                href="/resources"
                className="inline-block w-full px-4 py-3 bg-pink-400/80 text-white text-center rounded-md hover:bg-pink-500 active:bg-pink-600 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-pink-500/25"
              >
                View Resources
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
