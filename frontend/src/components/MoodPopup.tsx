import React, { useState } from "react";
import { getAccessToken } from "@/utils/auth";

interface MoodPopupProps {
  onClose: () => void;
}

const MOODS = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "bad", label: "Bad", emoji: "😞" },
  { value: "terrible", label: "Terrible", emoji: "😢" },
];

const MoodPopup: React.FC<MoodPopupProps> = ({ onClose }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        "http://localhost:8000/api/profiles/me/mood",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ current_mood: selectedMood }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit mood");
      }

      // Store last mood check timestamp
      localStorage.setItem("lastMoodCheck", Date.now().toString());

      // Close the popup
      onClose();
    } catch (error) {
      console.error("Error submitting mood:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-darkMode-surface rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          How are you feeling today?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Tracking your mood helps you understand your emotional patterns.
        </p>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                selectedMood === mood.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-darkMode-background hover:bg-gray-200 dark:hover:bg-darkMode-secondary"
              }`}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-sm">{mood.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedMood || isSubmitting}
            className={`px-4 py-2 rounded-md ${
              !selectedMood || isSubmitting
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark text-white"
            }`}
          >
            {isSubmitting ? (
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
                Submitting...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodPopup;
