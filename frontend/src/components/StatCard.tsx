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
    bg: "bg-pink-600 bg-opacity-20",
    text: "text-pink-600",
    icon: "text-pink-600",
  },
  secondary: {
    bg: "bg-gray-700",
    text: "text-gray-200",
    icon: "text-gray-400",
  },
  info: {
    bg: "bg-blue-900 bg-opacity-20",
    text: "text-blue-300",
    icon: "text-blue-400",
  },
  warning: {
    bg: "bg-yellow-900 bg-opacity-20",
    text: "text-yellow-300",
    icon: "text-yellow-400",
  },
  danger: {
    bg: "bg-red-900 bg-opacity-20",
    text: "text-red-300",
    icon: "text-red-400",
  },
  success: {
    bg: "bg-green-900 bg-opacity-20",
    text: "text-green-300",
    icon: "text-green-400",
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
    <div className={`rounded-lg p-5 shadow-md ${colorClasses.bg}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase">{title}</p>
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
