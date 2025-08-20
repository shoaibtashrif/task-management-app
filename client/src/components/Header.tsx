import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary-600">
              Task Manager
            </h1>
            <span className="text-sm text-gray-500">Organize your work</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn btn-primary">
              + New Board
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 