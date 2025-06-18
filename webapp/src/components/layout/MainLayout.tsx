import React from 'react';
import { Link } from 'react-router-dom';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-senior-friendly-background text-senior-friendly-text">
      <header className="bg-white shadow-md hidden md:flex">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-3xl font-bold text-senior-friendly-primary">
              夕阳忆记
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-lg hover:text-senior-friendly-primary">首页</Link>
              <Link to="/community" className="text-lg hover:text-senior-friendly-primary">社区</Link>
              <Link to="/profile" className="text-lg hover:text-senior-friendly-primary">我的</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8 pb-20 md:pb-8"> {/* Added padding-bottom for mobile to avoid overlap with bottom nav */}
        {children}
      </main>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around py-3 border-t border-gray-200">
        <Link to="/" className="flex flex-col items-center text-sm text-senior-friendly-primary hover:text-senior-friendly-primary-dark">
          {/* Icon Placeholder */}
          <span>Icon</span>
          <span>首页</span>
        </Link>
        <Link to="/my-creations" className="flex flex-col items-center text-sm text-senior-friendly-primary hover:text-senior-friendly-primary-dark">
          {/* Icon Placeholder */}
          <span>Icon</span>
          <span>创作</span>
        </Link>
        <Link to="/community" className="flex flex-col items-center text-sm text-senior-friendly-primary hover:text-senior-friendly-primary-dark">
          {/* Icon Placeholder */}
          <span>Icon</span>
          <span>社区</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-sm text-senior-friendly-primary hover:text-senior-friendly-primary-dark">
          {/* Icon Placeholder */}
          <span>Icon</span>
          <span>我的</span>
        </Link>
      </nav>

      <footer className="bg-white shadow-inner mt-auto">
        <div className="container mx-auto px-6 py-6 text-center">
          <p className="text-base">
            &copy; {new Date().getFullYear()} 夕阳忆记. 版权所有.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
