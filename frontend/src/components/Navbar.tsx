"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, logoutUser } from "@/utils/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status
    const authStatus = isAuthenticated();
    setIsLoggedIn(authStatus);

    // Get username if logged in
    if (authStatus) {
      const storedUsername = localStorage.getItem("username");
      setUsername(storedUsername || "User");
    }
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUsername(null);
    router.push("/login");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-black border-b border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-pink-600"
              >
                {/* Outer Circle */}
                <circle cx="12" cy="12" r="10" />

                {/* Brain Shape - Left Hemisphere */}
                <path d="M9 8c-1 1-2 2-2 3s1 2 2 3-1 2-1 3 1 2 2 2" />

                {/* Brain Shape - Right Hemisphere */}
                <path d="M15 8c1 1 2 2 2 3s-1 2-2 3 1 2 1 3-1 2-2 2" />

                {/* Central Split */}
                <path d="M12 6v12" />
              </svg>

              <span className="ml-2 text-xl font-bold text-pink-600">
                MindCare
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`${
                      pathname === "/dashboard"
                        ? "border-pink-600 text-pink-600"
                        : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className={`${
                      pathname === "/profile"
                        ? "border-pink-600 text-pink-600"
                        : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/chat"
                    className={`${
                      pathname === "/chat"
                        ? "border-pink-600 text-pink-600"
                        : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    Chat
                  </Link>
                  <Link
                    href="/coping"
                    className={`${
                      pathname === "/coping"
                        ? "border-pink-600 text-pink-600"
                        : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    Coping
                  </Link>
                  <Link
                    href="/relaxation"
                    className={`${
                      pathname === "/relaxation"
                        ? "border-pink-600 text-pink-600"
                        : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    Relaxation
                  </Link>
                  <Link
                    href="/mood-history"
                    className={`${
                      pathname === "/mood-history"
                        ? "border-pink-600 text-pink-600"
                        : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    Mood History
                  </Link>
                  <Link
                    href="/resources"
                    className={`${
                      pathname === "/resources"
                        ? "border-pink-600 text-pink-600"
                        : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    Resources
                  </Link>
                </>
              ) : (
                <Link
                  href="/"
                  className={`${
                    pathname === "/"
                      ? "border-pink-600 text-pink-600"
                      : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  Home
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center">
                {/* <span className="text-sm text-gray-300 mr-4">
                  Welcome, {username}
                </span> */}
                <button onClick={handleLogout} className="btn-primary">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-200 hover:text-pink-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`${
                  pathname === "/dashboard"
                    ? "bg-pink-600 bg-opacity-10 border-pink-600 text-pink-600"
                    : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`${
                  pathname === "/profile"
                    ? "bg-pink-600 bg-opacity-10 border-pink-600 text-pink-600"
                    : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/chat"
                className={`${
                  pathname === "/chat"
                    ? "bg-pink-600 bg-opacity-10 border-pink-600 text-pink-600"
                    : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                Chat
              </Link>
              <Link
                href="/coping"
                className={`${
                  pathname === "/coping"
                    ? "bg-pink-600 bg-opacity-10 border-pink-600 text-pink-600"
                    : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                Coping
              </Link>
              <Link
                href="/relaxation"
                className={`${
                  pathname === "/relaxation"
                    ? "bg-pink-600 bg-opacity-10 border-pink-600 text-pink-600"
                    : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                Relaxation
              </Link>
              <Link
                href="/mood-history"
                className={`${
                  pathname === "/mood-history"
                    ? "bg-pink-600 bg-opacity-10 border-pink-600 text-pink-600"
                    : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                Mood History
              </Link>
              <Link
                href="/resources"
                className={`${
                  pathname === "/resources"
                    ? "bg-pink-600 bg-opacity-10 border-pink-600 text-pink-600"
                    : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                Resources
              </Link>
            </>
          ) : (
            <Link
              href="/"
              className={`${
                pathname === "/"
                  ? "bg-pink-600 bg-opacity-10 border-pink-600 text-pink-600"
                  : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-700">
          {isLoggedIn ? (
            <div className="space-y-2 px-4">
              <div className="text-base font-medium text-gray-200">
                {username}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="btn-primary w-full text-center"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 px-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-pink-600 block py-2 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn-primary text-center py-2"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
