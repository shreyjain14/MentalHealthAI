"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { getAccessToken } from "@/utils/auth";

type Resource = {
  title: string;
  description: string;
  id: number;
  domain: string;
  path: string;
  upvotes: number;
  created_at: string;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>("newest");

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
  });
  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
    url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Apply sorting to resources
  const sortedResources = useMemo(() => {
    return [...resources].sort((a, b) => {
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
  }, [resources, sortOption]);

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      const response = await fetch("http://localhost:8000/api/resources/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setResources(data.resources || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
      setError("Failed to fetch resources. Please try again later.");
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

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      title: "",
      description: "",
      url: "",
    };
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    if (!formData.url.trim()) {
      errors.url = "URL is required";
      isValid = false;
    } else if (!isValidUrl(formData.url)) {
      errors.url = "Please enter a valid URL";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAccessToken();
      const response = await fetch("http://localhost:8000/api/resources/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      // Add the new resource to the list
      setResources((prev) => [data, ...prev]);

      // Reset form
      setFormData({
        title: "",
        description: "",
        url: "",
      });

      // Show success message
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsAdding(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to add resource:", err);
      setError("Failed to add resource. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (resourceId: number) => {
    try {
      const token = getAccessToken();
      const response = await fetch("http://localhost:8000/api/resources/vote", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_id: resourceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const updatedResource = await response.json();

      // Update the local state to reflect the upvote
      setResources(
        resources.map((resource) =>
          resource.id === resourceId
            ? { ...resource, upvotes: updatedResource.upvotes }
            : resource
        )
      );
    } catch (err) {
      console.error("Failed to upvote resource:", err);
      setError("Failed to upvote. Please try again later.");
    }
  };

  // Format domain and path for display
  const formatUrl = (domain: string, path: string) => {
    // Ensure path starts with a slash if it doesn't already
    const formattedPath = path.startsWith("/") ? path : `/${path}`;
    return `https://${domain}${formattedPath}`;
  };

  // Check if a resource is from specific platforms
  const isYouTube = (domain: string) => {
    return domain.includes("youtube.com") || domain.includes("youtu.be");
  };

  const isFacebook = (domain: string) => {
    return domain.includes("facebook.com") || domain.includes("fb.com");
  };

  const isInstagram = (domain: string) => {
    return domain.includes("instagram.com") || domain.includes("ig.com");
  };

  const isWhatsApp = (domain: string) => {
    return domain.includes("whatsapp.com") || domain.includes("wa.me");
  };

  // Get platform name for display
  const getPlatformName = (domain: string) => {
    if (isYouTube(domain)) return "YouTube";
    if (isFacebook(domain)) return "Facebook";
    if (isInstagram(domain)) return "Instagram";
    if (isWhatsApp(domain)) return "WhatsApp";
    return "Resource";
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
          <h1 className="text-2xl font-bold text-white">Resources</h1>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 rounded bg-pink-600 hover:bg-pink-700 text-white transition-colors"
          >
            {isAdding ? "Cancel" : "Add Resource"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-20 text-red-300 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {submitSuccess && (
          <div className="bg-green-900 bg-opacity-20 text-green-300 p-3 rounded-md mb-4">
            Resource added successfully!
          </div>
        )}

        {/* Add resource form */}
        {isAdding && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Add New Resource
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-pink-600 bg-gray-700 text-white"
                  placeholder="Enter resource title"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-pink-600 bg-gray-700 text-white"
                  placeholder="Describe this resource"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-pink-600 bg-gray-700 text-white"
                  placeholder="https://example.com"
                />
                {formErrors.url && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.url}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded ${
                    isSubmitting
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-pink-600 hover:bg-pink-700"
                  } text-white transition-colors`}
                >
                  {isSubmitting ? "Adding..." : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sorting controls */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Sort Resources</h2>
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
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedResources.length > 0 ? (
              sortedResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                          {resource.title}
                        </h2>
                        <p className="text-gray-300 mb-3">
                          {resource.description}
                        </p>
                        <a
                          href={formatUrl(resource.domain, resource.path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-400 hover:text-pink-300 transition-colors flex items-center"
                        >
                          {isYouTube(resource.domain) ? (
                            <>
                              <svg
                                className="w-5 h-5 mr-2 text-red-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                              </svg>
                              Watch on YouTube
                            </>
                          ) : isFacebook(resource.domain) ? (
                            <>
                              <svg
                                className="w-5 h-5 mr-2 text-blue-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                              </svg>
                              Visit on Facebook
                            </>
                          ) : isInstagram(resource.domain) ? (
                            <>
                              <svg
                                className="w-5 h-5 mr-2 text-pink-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                              View on Instagram
                            </>
                          ) : isWhatsApp(resource.domain) ? (
                            <>
                              <svg
                                className="w-5 h-5 mr-2 text-green-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                              </svg>
                              Open in WhatsApp
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 mr-2 text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                />
                              </svg>
                              {resource.domain}
                            </>
                          )}
                        </a>
                      </div>
                      <button
                        onClick={() => handleUpvote(resource.id)}
                        className="flex flex-col items-center bg-gray-700 hover:bg-gray-600 rounded-md px-3 py-2 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-green-400 mt-1">
                          {resource.upvotes}
                        </span>
                      </button>
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                      Added: {formatDate(resource.created_at)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl">No resources found.</p>
                <p className="mt-2">Be the first to add a helpful resource!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
