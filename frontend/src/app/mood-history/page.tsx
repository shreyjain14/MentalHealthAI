"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getAccessToken, isAuthenticated } from "@/utils/auth";

type MoodEntry = {
  mood: string;
  timestamp: string;
};

type MoodHistoryResponse = {
  history: MoodEntry[];
};

// Map mood values to numeric values for the chart
const moodValueMap: Record<string, number> = {
  Great: 5,
  Good: 4,
  Okay: 3,
  Bad: 2,
  Terrible: 1,
};

export default function MoodHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [timeRange, setTimeRange] = useState<number>(7); // Default to 7 days

  // Fetch mood history on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    fetchMoodHistory(timeRange);
  }, [router, timeRange]);

  const fetchMoodHistory = async (days: number) => {
    try {
      setLoading(true);
      const token = getAccessToken();
      const response = await fetch(
        `http://localhost:8000/api/profiles/me/mood-history?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data: MoodHistoryResponse = await response.json();
      // Sort by timestamp to ensure chronological order
      const sortedHistory = [...data.history].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setMoodHistory(sortedHistory);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch mood history:", err);
      setError("Failed to fetch mood history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get background color based on mood
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "Great":
        return "bg-green-500";
      case "Good":
        return "bg-green-400";
      case "Okay":
        return "bg-yellow-400";
      case "Bad":
        return "bg-red-400";
      case "Terrible":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  // Calculate the max height for the graph bars
  const maxBarHeight = 200; // in pixels

  const renderGraph = () => {
    if (moodHistory.length === 0) {
      return (
        <div className="text-center py-10 text-gray-400">
          <p>No mood data available for this time period.</p>
        </div>
      );
    }

    return (
      <div className="mt-6 bg-gray-800 p-6 rounded-lg">
        <div className="flex items-end justify-between space-x-2 h-64">
          {moodHistory.map((entry, index) => {
            const moodValue = moodValueMap[entry.mood] || 3; // Default to Okay if unknown
            const height = (moodValue / 5) * maxBarHeight;

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 min-w-0"
              >
                <div className="w-full relative group">
                  <div
                    className={`${getMoodColor(
                      entry.mood
                    )} rounded-t transition-all duration-300 hover:opacity-80`}
                    style={{ height: `${height}px` }}
                  />
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {entry.mood} - {formatDate(entry.timestamp)}
                  </div>
                </div>
                <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-4 border-t border-gray-700 pt-2">
          <div>Terrible</div>
          <div>Bad</div>
          <div>Okay</div>
          <div>Good</div>
          <div>Great</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Mood History</h1>

          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-600"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 3 Months</option>
              <option value={365}>Last Year</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-20 text-red-300 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div>
            {/* Mood Legend */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h2 className="text-white font-semibold mb-3">Mood Scale</h2>
              <div className="flex items-center space-x-4">
                {["Terrible", "Bad", "Okay", "Good", "Great"].map((mood) => (
                  <div key={mood} className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full ${getMoodColor(
                        mood
                      )} mr-2`}
                    ></div>
                    <span className="text-gray-300 text-sm">{mood}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Graph */}
            {renderGraph()}

            {/* Mood History List */}
            <div className="mt-8">
              <h2 className="text-white font-semibold mb-4">Recent Entries</h2>
              <div className="grid gap-3">
                {moodHistory.length > 0 ? (
                  [...moodHistory] // Create a copy to reverse without modifying original
                    .reverse() // Show most recent entries first
                    .slice(0, 10) // Show only the latest 10 entries
                    .map((entry, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full ${getMoodColor(
                              entry.mood
                            )} mr-3`}
                          ></div>
                          <span className="text-white">{entry.mood}</span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p>No mood entries recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
