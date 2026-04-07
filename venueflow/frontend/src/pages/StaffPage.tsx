import React, { useState } from 'react';
import { broadcastStaffAlert } from '../services/api';
import AccessibleAlert from '../components/AccessibleAlert';

const StaffPage: React.FC = () => {
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      await broadcastStaffAlert(announcement);
      setStatus({ type: 'success', message: 'Broadcast sent successfully!' });
      setAnnouncement('');
    } catch {
      setStatus({ type: 'error', message: 'Failed to send broadcast. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Staff Operations Dashboard</h1>
      
      {status && status.type === 'error' && (
        <AccessibleAlert message={status.message} />
      )}
      
      {status && status.type === 'success' && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="status" aria-live="polite">
          {status.message}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-sm">
        <h2 className="text-xl font-bold mb-4">Broadcast Announcement</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="announcement" className="block text-sm font-medium text-gray-700 mb-2">
            Message to all attendees
          </label>
          <textarea
            id="announcement"
            className="w-full border rounded p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={4}
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            placeholder="E.g., Gate 3 is temporarily closed..."
            required
            aria-required="true"
          ></textarea>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Broadcast Live'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffPage;
