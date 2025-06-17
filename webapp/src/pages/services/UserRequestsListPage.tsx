import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserRequestListItem from '../../components/services/UserRequestListItem';
import { getUserServiceRequests } from '../../services/api';
import type { ServiceRequest } from '../../services/api'; // 类型导入

const UserRequestsListPage: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserServiceRequests(); // Uses non-mock API
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">My Service Requests</h1>
        <Link
          to="/services/request"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          Submit New Request
        </Link>
      </div>

      {isLoading && (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="dark:text-gray-300 mt-4">Loading your requests...</p>
        </div>
      )}
      {error && <p className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900 p-4 rounded-md shadow">{error}</p>}

      {!isLoading && !error && requests.length === 0 && (
        <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">You have not submitted any service requests yet.</p>
        </div>
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
