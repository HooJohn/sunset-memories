import React from 'react';
import { Link } from 'react-router-dom'; // For a simple nav example

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                OurApp
              </Link>
            </div>
            {/* Basic Nav Links - can be expanded into a proper responsive Nav component later */}
            <div className="hidden sm:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link to="/community" className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Community</Link>
                <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
                {/* Add more links as needed */}
              </div>
            </div>
            {/* Mobile menu button placeholder */}
            <div className="sm:hidden">
              <button type="button" className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600" aria-label="Toggle menu">
                {/* Icon placeholder (e.g., hamburger icon) */}
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} OurApp. All rights reserved.
          </p>
          {/* Additional footer links can go here */}
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
