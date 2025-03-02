"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getAccessToken } from "@/utils/auth";
import Navbar from "@/components/Navbar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessagePart = {
  type: "text" | "thinking";
  content: string;
};

type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
  isStreaming?: boolean;
  expandedThinking?: boolean[];
};

type StreamingChunk = {
  message_id: number;
  chunk?: string;
  type: string;
  message?: string;
  error?: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnecting...");

  // Streaming message state
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Refs for WebSocket and accumulated text
  const socketRef = useRef<WebSocket | null>(null);
  const accumulatedTextRef = useRef<{ [key: number]: string }>({});
  const streamingDivRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // Add this helper function to parse thinking content
  const parseThinkingContent = (content: string) => {
    const parts = [];
    // Replace 's' flag with a workaround that works in ES2015
    const regex = /<think>([\s\S]*?)<\/think>/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }
      parts.push({
        type: "thinking",
        content: match[1],
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return parts;
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    // Reset streaming state before connecting
    accumulatedTextRef.current = {};
    setActiveMessageId(null);

    const token = getAccessToken();
    if (!token) {
      console.error("No access token found");
      return;
    }

    const wsUrl = `ws://localhost:8000/api/chat/ws/${token}`;
    console.log("Connecting to WebSocket:", wsUrl);

    try {
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log("WebSocket connection established");
        setIsConnected(true);
        setConnectionStatus("Connected");
      };

      socketRef.current.onmessage = (event) => {
        try {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] Received message:`, event.data);

          const data = JSON.parse(event.data) as StreamingChunk;

          if (data.type === "chunk") {
            handleChunk(data);
          } else if (data.type === "system") {
            // Handle system messages if needed
            console.log("System message:", data);
          } else if (data.type === "start") {
            // Handle start of a new message
            console.log(`Starting message ${data.message_id}`);
            handleStartMessage(data.message_id);
          } else if (data.type === "end") {
            // Handle end of streaming
            console.log(`Ending message ${data.message_id}`);
            finalizeMessage(data.message_id);
          } else if (data.error) {
            console.error("Error from server:", data.error);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      socketRef.current.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus(`Disconnected (${event.code})`);
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("Connection Error");
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setConnectionStatus("Connection Failed");
    }
  };

  // Handle start of a new message
  const handleStartMessage = (messageId: number) => {
    const newMessage = {
      id: `ai-${messageId}`,
      sender: "ai" as const,
      content: "",
      isStreaming: true,
      expandedThinking: [], // Initialize with empty array for expandedThinking
    };
    setMessages((prev) => [...prev, newMessage]);
    setActiveMessageId(messageId);
    accumulatedTextRef.current[messageId] = "";
  };

  // Handle incoming chunks
  const handleChunk = (data: StreamingChunk) => {
    const { message_id, chunk } = data;

    if (!chunk) return;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === `ai-${message_id}`) {
          // Update content
          const newContent = msg.content + chunk;

          // Check for think tags in the accumulated content
          const parts = parseThinkingContent(newContent);
          const thinkingCount = parts.filter(
            (p) => p.type === "thinking"
          ).length;

          // Ensure expandedThinking array has correct length with all false values
          // This ensures thinking sections are collapsed by default
          let expandedThinking = [...(msg.expandedThinking || [])];

          // If we have more thinking sections than before, add new collapsed (false) entries
          if (expandedThinking.length < thinkingCount) {
            expandedThinking = [
              ...expandedThinking,
              ...Array(thinkingCount - expandedThinking.length).fill(false),
            ];
          }

          // Store the updated content and expandedThinking state
          return {
            ...msg,
            content: newContent,
            expandedThinking,
          };
        }
        return msg;
      })
    );

    // Keep this for scroll behavior
    setUpdateTrigger((prev) => prev + 1);
  };

  // Finalize a message when streaming is complete
  const finalizeMessage = (messageId: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === `ai-${messageId}`) {
          // Get the final content
          const content = msg.content;

          // Final check for thinking tags to ensure they are properly collapsed
          const parts = parseThinkingContent(content);
          const thinkingCount = parts.filter(
            (p) => p.type === "thinking"
          ).length;

          // Ensure expandedThinking array is properly set up
          let expandedThinking = [...(msg.expandedThinking || [])];
          if (expandedThinking.length < thinkingCount) {
            expandedThinking = [
              ...expandedThinking,
              ...Array(thinkingCount - expandedThinking.length).fill(false),
            ];
          }

          return {
            ...msg,
            content,
            expandedThinking,
            isStreaming: false,
          };
        }
        return msg;
      })
    );

    // Clean up accumulated text
    if (accumulatedTextRef.current[messageId]) {
      delete accumulatedTextRef.current[messageId];
    }
  };

  // Send a message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || !socketRef.current || !isConnected) return;

    // Add the message to the UI
    const newMessage = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      content: inputMessage,
    };
    setMessages((prev) => [...prev, newMessage]);

    // Send to server
    try {
      const payload = {
        message: inputMessage,
      };
      socketRef.current.send(JSON.stringify(payload));
      console.log("Message sent:", payload);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // Clear input
    setInputMessage("");
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, updateTrigger]);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Check if user is authenticated, if not redirect to login
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    setLoading(false);
    connectWebSocket();

    // Cleanup WebSocket connection when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full flex flex-col">
        {/* Connection Status */}
        <div
          className={`mb-4 px-4 py-2 rounded-md text-sm ${
            isConnected
              ? "bg-green-900 bg-opacity-20 text-green-300"
              : "bg-red-900 bg-opacity-20 text-red-300"
          }`}
        >
          <div className="flex justify-between items-center">
            <span>Status: {connectionStatus}</span>
            {!isConnected && (
              <button
                onClick={connectWebSocket}
                className="ml-4 px-2 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700 transition-colors"
              >
                Reconnect
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-900 bg-opacity-50 rounded-md p-4 mb-4 space-y-4 min-h-[400px]">
          {messages.map((message) => {
            const parts = parseThinkingContent(message.content);
            const hasThinking = parts.some((p) => p.type === "thinking");

            return (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-pink-600 bg-opacity-20 ml-12 text-right"
                    : "bg-gray-800 mr-12"
                } ${message.isStreaming ? "animate-pulse-border relative" : ""}`}
              >
                <strong className="font-semibold">
                  {message.sender === "user" ? "You" : "AI"}:
                </strong>
                <div className={`ml-1 whitespace-pre-wrap ${message.sender === "user" ? "text-right" : "text-left"}`}>
                  {message.sender === "ai" && hasThinking ? (
                    parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <div key={index} className="prose prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {part.content}
                            </ReactMarkdown>
                          </div>
                        );
                      }

                      // This is a thinking part - it should be collapsed by default
                      const isExpanded = message.expandedThinking?.[index] ?? false;

                      return (
                        <div key={index} className="my-1">
                          <button
                            onClick={() => {
                              const newExpanded = [...(message.expandedThinking || [])];
                              newExpanded[index] = !isExpanded;
                              setMessages((prev) =>
                                prev.map((msg) =>
                                  msg.id === message.id
                                    ? { ...msg, expandedThinking: newExpanded }
                                    : msg
                                )
                              );
                            }}
                            className="text-sm text-pink-300 hover:text-pink-400 flex items-center"
                          >
                            {isExpanded ? "−" : "+"} Thinking
                          </button>
                          {isExpanded && (
                            <div className="ml-4 text-gray-400 text-sm bg-gray-900 p-2 rounded mt-1 border border-gray-700 max-h-96 overflow-y-auto">
                              {part.content}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {message.sender === "ai" ? (
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {parseThinkingContent(message.content)
                              .filter((part) => part.type === "text")
                              .map((part) => part.content)
                              .join("")}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                      {message.isStreaming && (
                        <span className="inline-block ml-1 animate-pulse">▌</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!isConnected}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            className="flex-grow p-2 bg-gray-800 text-white border border-gray-700 rounded-l focus:outline-none focus:ring-1 focus:ring-pink-600"
          />
          <button
            type="submit"
            disabled={!isConnected}
            className={`px-4 py-2 ${
              isConnected
                ? "bg-pink-600 hover:bg-pink-700"
                : "bg-gray-700 cursor-not-allowed"
            } text-white rounded-r transition-colors`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
