"use client";

import React, { useEffect, useState } from "react";
import { getStats } from "@/utils/stats";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import Footer from "@/components/Footer";
interface StatsData {
  total_count: number;
  by_level: {
    INFO: number;
    WARNING: number;
    ERROR: number;
    CRITICAL: number;
  };
  top_paths: Record<string, number>;
  period_days: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format the top paths data for display
  const formatTopPaths = (paths: Record<string, number>) => {
    return Object.entries(paths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-black py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                <span className="block text-primary">MindCare</span>
                <span className="block text-white">
                  Your Mental Health Companion
                </span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Take care of your mental wellbeing with our tools and resources.
                Track your mood, journal your thoughts, and find resources to
                help you on your journey.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <a
                    href="/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </a>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <a
                    href="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-gray-800 hover:bg-primary hover:text-white md:py-4 md:text-lg md:px-10 transition-colors duration-300"
                  >
                    Log In
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-12 bg-primary bg-opacity-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-white">
                App Statistics
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300">
                See how people are using MindCare
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {/* Total Visitors Stat */}
        <div className="max-w-md mx-auto">
                  <StatCard
                    title="Total Visits"
                    value={stats?.total_count || 0}
                    description={`In the last ${stats?.period_days || 7} days`}
                    icon={
                      <svg
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    }
                  />
                </div>
              </>
            )}
          </div>
        </section>
      </main>

    </div>
  );
}
