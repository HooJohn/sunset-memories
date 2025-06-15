// Placeholder for UserRequestsListPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserRequestListItem from '../../components/services/UserRequestListItem';
import { getUserServiceRequests, ServiceRequest } from '../../services/api'; // To be created/updated in api.ts

const UserRequestsListPage: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserServiceRequests();
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch service requests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load requests.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Service Requests</h1>
        <Link
          to="/services/request"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit New Request
        </Link>
      </div>

      {isLoading && <p className="text-center text-gray-600">Loading your requests...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

      {!isLoading && !error && requests.length === 0 && (
        <p className="text-center text-gray-600">You have not submitted any service requests yet.</p>
      )}

      {!isLoading && !error && requests.length > 0 && (
        <div className="space-y-6">
          {requests.map(request => (
            <UserRequestListItem key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRequestsListPage;
