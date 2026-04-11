import React from 'react';
import ItineraryPlanner from '../components/ItineraryPlanner';

const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Beat the queues',
    body: 'See live wait times for gates, concessions, and restrooms before you move.',
  },
  {
    title: 'Smart crowd flow',
    body: 'Color-coded heatmaps and alternative routes help you avoid bottlenecks.',
  },
  {
    title: 'Ask anything',
    body: 'Our Gemini-powered assistant answers venue questions instantly, 24/7.',
  },
];

const HomePage: React.FC = () => {
  return (
    <div>
      <section className="text-center py-12" aria-labelledby="home-heading">
        <h1 id="home-heading" className="text-4xl font-bold mb-4 text-blue-900">
          Welcome to VenueFlow
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          Your smart companion for the ultimate stadium experience. Beat the queues,
          find what you need with our AI assistant, and enjoy the event.
        </p>
      </section>

      <section
        aria-label="Key features"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="bg-white p-5 rounded shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-blue-900 mb-1">{feature.title}</h2>
            <p className="text-gray-700 text-sm">{feature.body}</p>
          </article>
        ))}
      </section>

      <ItineraryPlanner />
    </div>
  );
};

export default HomePage;
