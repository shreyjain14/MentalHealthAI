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
                className="text-primary"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Z"></path>
                <path d="M7 9h10"></path>
                <path d="M12 7v10"></path>
                <path d="M16 15a2 2 0 0 1-4 0 2 2 0 0 0-4 0"></path>
              </svg>
              <span className="ml-2 text-xl font-bold text-primary">
                MindCare
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  pathname === "/"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    href="/dashboard"
                    className={`${
                      pathname === "/dashboard"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className={`${
                      pathname === "/profile"
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-300 mr-4">
                  Welcome, {username}
                </span>
                <button onClick={handleLogout} className="btn-primary">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-200 hover:text-primary transition-colors duration-200"
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
          <Link
            href="/"
            className={`${
              pathname === "/"
                ? "bg-primary bg-opacity-10 border-primary text-primary"
                : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          {isLoggedIn && (
            <>
              <Link
                href="/dashboard"
                className={`${
                  pathname === "/dashboard"
                    ? "bg-primary bg-opacity-10 border-primary text-primary"
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
                    ? "bg-primary bg-opacity-10 border-primary text-primary"
                    : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
            </>
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
                className="text-gray-300 hover:text-primary block py-2 transition-colors duration-200"
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
