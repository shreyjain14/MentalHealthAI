"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  validation?: (value: string) => string | null;
}

interface AuthFormProps {
  fields: FormField[];
  submitButtonText: string;
  onSubmit: (data: Record<string, string>) => Promise<void>;
  isLoading?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
  fields,
  submitButtonText,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.id]: "",
      }),
      {}
    )
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on field change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const value = formData[field.id];

      // Required validation
      if (field.required && !value) {
        newErrors[field.id] = `${field.label} is required`;
        isValid = false;
        return;
      }

      // Min length validation
      if (field.minLength && value.length < field.minLength) {
        newErrors[
          field.id
        ] = `${field.label} must be at least ${field.minLength} characters`;
        isValid = false;
        return;
      }

      // Custom validation
      if (field.validation && value) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.id] = validationError;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      if (error instanceof Error) {
        setSubmissionError(error.message);
      } else {
        setSubmissionError("An unknown error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {field.label}
          </label>
          <input
            id={field.id}
            name={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.id]}
            onChange={handleChange}
            className="input-field"
            required={field.required}
            minLength={field.minLength}
          />
          {errors[field.id] && (
            <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
          )}
        </div>
      ))}

      {submissionError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">
            {submissionError}
          </p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
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
              Processing...
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
