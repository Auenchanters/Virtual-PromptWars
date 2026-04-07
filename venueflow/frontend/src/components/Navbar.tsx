import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold aria-label='VenueFlow Home'">
          VenueFlow
        </Link>
        <div className="flex gap-4">
          <Link to="/" className="hover:underline focus:ring-2 focus:ring-white rounded">Home</Link>
          <Link to="/dashboard" className="hover:underline focus:ring-2 focus:ring-white rounded">Dashboard</Link>
          <Link to="/staff" className="hover:underline focus:ring-2 focus:ring-white rounded">Staff Feed</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
