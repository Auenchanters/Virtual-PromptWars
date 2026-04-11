import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const navLinkBase =
  'px-3 py-2 rounded hover:underline focus:outline-none focus:ring-2 focus:ring-white';

const navLinkActive = 'font-bold underline';

const Navbar: React.FC = () => {
  return (
    <header className="bg-blue-700 text-white shadow">
      <nav
        aria-label="Primary navigation"
        className="container mx-auto px-4 py-4 flex justify-between items-center"
      >
        <Link to="/" className="text-xl font-bold" aria-label="VenueFlow home">
          VenueFlow
        </Link>
        <ul className="flex gap-2 list-none m-0 p-0">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : ''}`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : ''}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/staff"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : ''}`
              }
            >
              Staff
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
