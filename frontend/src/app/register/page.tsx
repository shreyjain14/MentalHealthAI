"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import AuthForm from "@/components/AuthForm";
import { registerUser } from "@/utils/auth";
import Navbar from "@/components/Navbar";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "Please enter a valid email address";
  };

  const registerFields = [
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      required: true,
      validation: validateEmail,
    },
    {
      id: "username",
      label: "Username",
      type: "text",
      placeholder: "Choose a username",
      required: true,
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a password",
      required: true,
      minLength: 8,
    },
    {
      id: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm your password",
      required: true,
      validation: (value: string) => {
        const passwordInput = document.getElementById(
          "password"
        ) as HTMLInputElement;
        return passwordInput && value === passwordInput.value
          ? null
          : "Passwords do not match";
      },
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      // Navigate to login page after successful registration
      router.push("/login?registered=true");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <AuthLayout
        title="Create an Account"
        subtitle="Join MindCare to take care of your mental well-being"
        alternateActionText="Already have an account? Sign in"
        alternateActionLink="/login"
      >
        <AuthForm
          fields={registerFields}
          submitButtonText="Sign Up"
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </AuthLayout>
    </div>
  );
}
