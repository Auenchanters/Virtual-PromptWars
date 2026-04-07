import React from 'react';
import ItineraryPlanner from '../components/ItineraryPlanner';

const HomePage: React.FC = () => {
  return (
    <div>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4 text-blue-900">Welcome to VenueFlow</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Your smart companion for the ultimate stadium experience. Beat the queues, 
          find what you need with our AI assistant, and enjoy the event!
        </p>
      </div>

      <ItineraryPlanner />
    </div>
  );
};

export default HomePage;
