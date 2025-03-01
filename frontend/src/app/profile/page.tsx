"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getAccessToken } from "@/utils/auth";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "@/utils/profile";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    current_mood: "",
    primary_concerns: "",
    coping_strategies: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated, if not redirect to login
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Try to get username from localStorage
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "User");

    // Fetch user profile
    fetchUserProfile();
  }, [router]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
      setFormData(profileData);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const updatedProfile = await updateUserProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!username || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">User Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Mood
                </label>
                <input
                  type="text"
                  name="current_mood"
                  value={formData.current_mood}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-gray-800 text-white"
                  placeholder="How are you feeling today?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Concerns
                </label>
                <textarea
                  name="primary_concerns"
                  value={formData.primary_concerns}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-gray-800 text-white"
                  placeholder="What's on your mind? What are your main concerns?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coping Strategies
                </label>
                <textarea
                  name="coping_strategies"
                  value={formData.coping_strategies}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-gray-800 text-white"
                  placeholder="What strategies help you cope with stress or difficult emotions?"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(
                      profile || {
                        current_mood: "",
                        primary_concerns: "",
                        coping_strategies: "",
                      }
                    );
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-md ${
                    isSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-primary-dark text-white"
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Current Mood
                </h2>
                <p className="text-gray-300 bg-gray-800 p-3 rounded-md">
                  {profile?.current_mood || "No mood set"}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Primary Concerns
                </h2>
                <p className="text-gray-300 bg-gray-800 p-3 rounded-md whitespace-pre-line">
                  {profile?.primary_concerns || "No concerns shared"}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Coping Strategies
                </h2>
                <p className="text-gray-300 bg-gray-800 p-3 rounded-md whitespace-pre-line">
                  {profile?.coping_strategies || "No strategies shared"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
