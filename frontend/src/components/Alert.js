import { useState } from "react";

export default function Alert({ message, linkText, linkHref, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative">
      {/* Alert */}
      <div
        className="fixed z-20 flex items-center p-4 transform -translate-x-1/2 bg-gray-200 rounded-lg top-3 left-1/2 dark:bg-gray-800"
        role="alert"
      >
        <svg
          className="flex-shrink-0 w-4 h-4 dark:text-gray-300"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
        <span className="sr-only">Info</span>
        <div className="font-medium text-gray-800 ms-3 dark:text-gray-300">
          {message}{" "}
          <a
            href={linkHref}
            className="font-semibold underline hover:no-underline"
          >
            {linkText}
          </a>
        </div>
        <button
          type="button"
          className="ms-auto -mx-1.5 -my-1.5 bg-gray-200 text-gray-500 rounded-lg focus:ring-2 focus:ring-gray-400 p-1.5 hover:bg-gray-300 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Close"
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
        >
          <span className="sr-only">Dismiss</span>
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
