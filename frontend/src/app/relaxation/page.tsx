"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { getAccessToken } from "@/utils/auth";

type RelaxationExercise = {
  title: string;
  description: string;
  tags: string[];
  id: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
};

export default function RelaxationPage() {
  const [exercises, setExercises] = useState<RelaxationExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingPersonalized, setGeneratingPersonalized] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("newest");

  // Extract all unique tags from exercises
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    exercises.forEach((exercise) => {
      exercise.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [exercises]);

  // Apply sorting and filtering to exercises
  const sortedAndFilteredExercises = useMemo(() => {
    // First apply filtering
    let result =
      selectedTags.length === 0
        ? exercises
        : exercises.filter((exercise) =>
            selectedTags.some((tag) => exercise.tags.includes(tag))
          );

    // Then apply sorting
    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "most-upvotes":
          return b.upvotes - a.upvotes;
        case "least-upvotes":
          return a.upvotes - b.upvotes;
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });
  }, [exercises, selectedTags, sortOption]);

  // Handle tag selection toggle
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Clear all selected tags
  const clearTags = () => {
    setSelectedTags([]);
  };

  // Fetch relaxation exercises on component mount
  useEffect(() => {
    fetchRelaxationExercises();
  }, []);

  const fetchRelaxationExercises = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      const response = await fetch(
        "http://localhost:8000/api/relaxation/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setExercises(data.exercises || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch relaxation exercises:", err);
      setError("Failed to fetch relaxation exercises. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const generateNewExercise = async () => {
    try {
      setGenerating(true);
      const token = getAccessToken();
      const response = await fetch(
        "http://localhost:8000/api/relaxation/auto-generate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      // Refresh the list after generating a new exercise
      fetchRelaxationExercises();
    } catch (err) {
      console.error("Failed to generate new relaxation exercise:", err);
      setError(
        "Failed to generate new relaxation exercise. Please try again later."
      );
    } finally {
      setGenerating(false);
    }
  };

  const generateNewPersonalizedExercise = async () => {
    try {
      setGeneratingPersonalized(true);
      const token = getAccessToken();
      const response = await fetch(
        "http://localhost:8000/api/relaxation/personalized",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      // Refresh the list after generating a new exercise
      fetchRelaxationExercises();
    } catch (err) {
      console.error(
        "Failed to generate new personalized relaxation exercise:",
        err
      );
      setError(
        "Failed to generate new personalized relaxation exercise. Please try again later."
      );
    } finally {
      setGeneratingPersonalized(false);
    }
  };

  const handleUpvote = async (exerciseId: number) => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        "http://localhost:8000/api/relaxation/vote",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exercise_id: exerciseId,
            vote_type: "upvote",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      // Update the local state to reflect the upvote
      setExercises(
        exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, upvotes: exercise.upvotes + 1 }
            : exercise
        )
      );
    } catch (err) {
      console.error("Failed to upvote relaxation exercise:", err);
      setError("Failed to upvote. Please try again later.");
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            Relaxation Exercises
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={generateNewExercise}
              disabled={generating}
              className={`px-4 py-2 rounded ${
                generating
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              } text-white transition-colors`}
            >
              {generating ? "Generating..." : "Generate New Exercise"}
            </button>
            <button
              onClick={generateNewPersonalizedExercise}
              disabled={generatingPersonalized}
              className={`px-4 py-2 rounded ${
                generating
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              } text-white transition-colors`}
            >
              {generatingPersonalized
                ? "Generating..."
                : "Generate Personalized Exercise"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-20 text-red-300 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Controls section for filtering and sorting */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          {/* Sorting controls */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Sort & Filter</h2>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-600"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most-upvotes">Most Upvotes</option>
                <option value="least-upvotes">Least Upvotes</option>
              </select>
            </div>
          </div>

          {/* Tag filtering UI */}
          {allTags.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-white">
                  Filter by tags
                </h2>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearTags}
                    className="text-sm text-pink-400 hover:text-pink-300"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-pink-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {selectedTags.length > 0 && (
              <div className="mb-4 text-sm text-gray-400">
                Showing {sortedAndFilteredExercises.length} of{" "}
                {exercises.length} exercises
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAndFilteredExercises.length > 0 ? (
                sortedAndFilteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105 flex flex-col h-full"
                  >
                    <div className="p-6 flex-grow flex flex-col">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        {exercise.title}
                      </h2>
                      <p className="text-gray-300 mb-4">
                        {exercise.description}
                      </p>

                      {exercise.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {exercise.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                                selectedTags.includes(tag)
                                  ? "bg-pink-600 text-white"
                                  : "bg-pink-900 bg-opacity-40 text-pink-300 hover:bg-pink-800"
                              }`}
                              onClick={() => toggleTag(tag)}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          Added: {formatDate(exercise.created_at)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">
                            {exercise.upvotes} upvotes
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpvote(exercise.id)}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors mt-auto"
                    >
                      Works For Me
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <p className="text-xl">
                    No matching relaxation exercises found.
                  </p>
                  <p className="mt-2">
                    Try selecting different tags or clear the filters.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
