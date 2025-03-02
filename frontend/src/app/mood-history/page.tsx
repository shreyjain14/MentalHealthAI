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

interface ForecastPeriod {
  predicted_mood: string;
  confidence: number;
  reasoning: string;
}

interface MoodForecast {
  twelve_hours: ForecastPeriod;
  twenty_four_hours: ForecastPeriod;
  next_week: ForecastPeriod;
}

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
  const [forecast, setForecast] = useState<MoodForecast | null>(null);

  // Fetch mood history on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    fetchMoodHistory(timeRange);
    fetchMoodForecast();
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

  const fetchMoodForecast = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/profiles/me/mood-forecast", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch mood forecast");
      }

      const data = await response.json();
      setForecast(data);
    } catch (error) {
      console.error("Error fetching mood forecast:", error);
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

  // Get color based on predicted mood
  const getPredictedMoodColor = (mood: string) => {
    const moodLower = mood.toLowerCase();
    if (moodLower.includes("positive") || moodLower === "great") return "text-green-400";
    if (moodLower.includes("neutral") || moodLower === "okay") return "text-yellow-400";
    if (moodLower.includes("negative") || moodLower === "bad") return "text-red-400";
    if (moodLower === "variable") return "text-blue-400";
    return "text-gray-400";
  };

  // Get confidence bar color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "bg-green-500";
    if (confidence >= 40) return "bg-yellow-500";
    return "bg-red-500";
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

        {/* AI Mood Forecast Section */}
        {forecast && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">AI Mood Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 12 Hours Forecast */}
              <div className="bg-gray-800/80 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Next 12 Hours</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Predicted Mood:</span>
                    <span className={`font-medium ${getPredictedMoodColor(forecast.twelve_hours.predicted_mood)}`}>
                      {forecast.twelve_hours.predicted_mood}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Confidence:</span>
                      <span className="text-gray-300">{forecast.twelve_hours.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`${getConfidenceColor(forecast.twelve_hours.confidence)} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${forecast.twelve_hours.confidence}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{forecast.twelve_hours.reasoning}</p>
                </div>
              </div>

              {/* 24 Hours Forecast */}
              <div className="bg-gray-800/80 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Next 24 Hours</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Predicted Mood:</span>
                    <span className={`font-medium ${getPredictedMoodColor(forecast.twenty_four_hours.predicted_mood)}`}>
                      {forecast.twenty_four_hours.predicted_mood}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Confidence:</span>
                      <span className="text-gray-300">{forecast.twenty_four_hours.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`${getConfidenceColor(forecast.twenty_four_hours.confidence)} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${forecast.twenty_four_hours.confidence}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{forecast.twenty_four_hours.reasoning}</p>
                </div>
              </div>

              {/* Next Week Forecast */}
              <div className="bg-gray-800/80 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Next Week</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Predicted Mood:</span>
                    <span className={`font-medium ${getPredictedMoodColor(forecast.next_week.predicted_mood)}`}>
                      {forecast.next_week.predicted_mood}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Confidence:</span>
                      <span className="text-gray-300">{forecast.next_week.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`${getConfidenceColor(forecast.next_week.confidence)} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${forecast.next_week.confidence}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{forecast.next_week.reasoning}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
