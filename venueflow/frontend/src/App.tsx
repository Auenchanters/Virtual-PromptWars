import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import StaffPage from './pages/StaffPage';
import GeminiChatbot from './components/GeminiChatbot';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-blue-700 focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:underline"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/staff" element={<StaffPage />} />
        </Routes>
      </main>
      <GeminiChatbot />
    </div>
  );
}

export default App;
