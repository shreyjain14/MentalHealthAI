"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import AuthForm from "@/components/AuthForm";
import { loginUser } from "@/utils/auth";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loginFields = [
    {
      id: "username",
      label: "Username",
      type: "text",
      placeholder: "Enter your username",
      required: true,
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
      required: true,
      minLength: 8,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    try {
      await loginUser({
        username: formData.username,
        password: formData.password,
      });

      // Store the username in localStorage for display
      localStorage.setItem("username", formData.username);

      // Navigate to dashboard after successful login
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to your account to continue"
        alternateActionText="Don't have an account? Sign up"
        alternateActionLink="/register"
      >
        <AuthForm
          fields={loginFields}
          submitButtonText="Sign In"
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </AuthLayout>
    </div>
  );
}
