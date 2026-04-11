import React, { useState } from 'react';
import { broadcastStaffAlert } from '../services/api';
import AccessibleAlert from '../components/AccessibleAlert';
import { MAX_ANNOUNCEMENT_LENGTH } from '../utils/constants';

type Status =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

const StaffPage: React.FC = () => {
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = announcement.trim();
    if (!trimmed) {
      setValidationError('Announcement text is required before broadcasting.');
      return;
    }
    setValidationError(null);
    setLoading(true);
    setStatus(null);

    try {
      await broadcastStaffAlert(trimmed);
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

      {status?.type === 'error' && <AccessibleAlert message={status.message} />}

      {status?.type === 'success' && (
        <div
          className="bg-green-100 border-l-4 border-green-600 text-green-800 p-4 mb-6"
          role="status"
          aria-live="polite"
        >
          {status.message}
        </div>
      )}

      <section
        aria-labelledby="broadcast-heading"
        className="bg-white p-6 rounded shadow-sm"
      >
        <h2 id="broadcast-heading" className="text-xl font-bold mb-4">
          Broadcast Announcement
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="announcement"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Message to all attendees
          </label>
          <textarea
            id="announcement"
            className="w-full border rounded p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={announcement}
            onChange={(event) => setAnnouncement(event.target.value)}
            maxLength={MAX_ANNOUNCEMENT_LENGTH}
            aria-invalid={validationError ? 'true' : 'false'}
            aria-describedby={validationError ? 'announcement-error' : 'announcement-help'}
            placeholder="E.g., Gate 3 is temporarily closed..."
            required
          />
          <p
            id="announcement-help"
            className="text-xs text-gray-500 mb-3"
          >
            {announcement.length}/{MAX_ANNOUNCEMENT_LENGTH} characters
          </p>
          {validationError && (
            <p
              id="announcement-error"
              role="alert"
              className="mb-3 text-sm text-red-700"
            >
              {validationError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white font-bold py-2 px-4 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Broadcast Live'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default StaffPage;
