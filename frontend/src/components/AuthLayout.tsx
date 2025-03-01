"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  alternateActionText?: string;
  alternateActionLink?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  alternateActionText,
  alternateActionLink,
}: AuthLayoutProps) {
  return (
    <div className="py-12 flex items-center justify-center px-4 bg-secondary-light dark:bg-darkMode-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          {/* Replace with your actual logo */}
          <div className="flex items-center">
            <svg
              width="40"
              height="40"
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
            <span className="ml-2 text-2xl font-bold text-primary">
              MindCare
            </span>
          </div>
        </div>

        <div className="card bg-white dark:bg-darkMode-surface">
          <h2 className="text-2xl font-bold text-center text-foreground dark:text-darkMode-text mb-2">
            {title}
          </h2>

          {subtitle && (
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
              {subtitle}
            </p>
          )}

          {children}

          {alternateActionText && alternateActionLink && (
            <div className="text-center mt-6">
              <Link
                href={alternateActionLink}
                className="text-primary hover:text-primary-dark transition-colors"
              >
                {alternateActionText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
