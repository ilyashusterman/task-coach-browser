import React from "react";

const LoadingIndicator = ({ percentage, text }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-32 h-32 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-green-200 stroke-current"
            strokeWidth="10"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
          ></circle>
          <circle
            className="text-green-500 progress-ring__circle stroke-current"
            strokeWidth="10"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 * (1 - percentage / 100)}
            transform="rotate(-90 50 50)"
          ></circle>
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-2xl font-bold text-green-700">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <p className="mt-4 text-lg font-semibold text-green-700">{text}</p>
    </div>
  );
};

export default LoadingIndicator;
