import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="WebPilot AI Logo" className="h-8 w-8 mr-2" />
              <span>WebPilot AI</span>
            </Link>
          </div>
          <nav>
            <Link to="/" className="px-4 hover:text-gray-300">Home</Link>
            <Link to="/pentest" className="px-4 hover:text-gray-300">Pentest</Link>
            <Link to="/history" className="px-4 hover:text-gray-300">History</Link>
            <Link to="/settings" className="px-4 hover:text-gray-300">Settings</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
