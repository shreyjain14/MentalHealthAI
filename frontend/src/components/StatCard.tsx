import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "info" | "warning" | "danger" | "success";
}

const colorVariants = {
  primary: {
    bg: "bg-primary bg-opacity-20",
    text: "text-primary-light",
    icon: "text-primary-light",
  },
  secondary: {
    bg: "bg-gray-800 bg-opacity-50",
    text: "text-gray-200",
    icon: "text-gray-300",
  },
  info: {
    bg: "bg-blue-900 bg-opacity-20",
    text: "text-blue-200",
    icon: "text-blue-300",
  },
  warning: {
    bg: "bg-yellow-900 bg-opacity-20",
    text: "text-yellow-200",
    icon: "text-yellow-300",
  },
  danger: {
    bg: "bg-red-900 bg-opacity-20",
    text: "text-red-200",
    icon: "text-red-300",
  },
  success: {
    bg: "bg-green-900 bg-opacity-20",
    text: "text-green-200",
    icon: "text-green-300",
  },
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  color = "primary",
}: StatCardProps) {
  const colorClasses = colorVariants[color];

  return (
    <div className={`rounded-lg p-5 shadow-md ${colorClasses.bg} border border-opacity-10 border-white`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-300 uppercase">{title}</p>
          <h3 className={`mt-1 text-2xl font-bold ${colorClasses.text}`}>
            {value}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
        </div>
        {icon && <div className={`${colorClasses.icon}`}>{icon}</div>}
      </div>
    </div>
  );
}
