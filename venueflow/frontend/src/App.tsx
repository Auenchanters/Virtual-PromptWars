import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GeminiChatbot from './components/GeminiChatbot';
import { useRouteFocus } from './hooks/useRouteFocus';

const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));

const RouteFallback: React.FC = () => (
  <div role="status" aria-live="polite" className="text-gray-500 italic">
    Loading…
  </div>
);

function App() {
  useRouteFocus('main-content');

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-blue-700 focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:underline"
      >
        Skip to main content
      </a>
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-grow container mx-auto px-4 py-8 focus:outline-none"
      >
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/staff" element={<StaffPage />} />
          </Routes>
        </Suspense>
      </main>
      <GeminiChatbot />
    </div>
  );
}

export default App;
