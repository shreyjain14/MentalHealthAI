'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-pink-600"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
            <span className="ml-2 text-lg font-bold text-white">
              MindCare
            </span>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-center text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} MindCare. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 