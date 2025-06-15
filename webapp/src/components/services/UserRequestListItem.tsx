// Placeholder for UserRequestListItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ServiceRequest } from '../../services/api'; // Assuming this will be defined in api.ts

interface UserRequestListItemProps {
  request: ServiceRequest;
}

const UserRequestListItem: React.FC<UserRequestListItemProps> = ({ request }) => {
  const getStatusColor = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-indigo-600 bg-indigo-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <h3 className="text-xl font-semibold text-indigo-700 mb-2 sm:mb-0">
          Service: {request.type}
        </h3>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
          Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>
      <p className="text-gray-700 mb-2">
        <strong className="font-medium">Description:</strong> {request.description.substring(0, 100)}{request.description.length > 100 ? '...' : ''}
      </p>
      <p className="text-gray-700 mb-2">
        <strong className="font-medium">Address:</strong> {request.address}
      </p>
      <p className="text-sm text-gray-500 mb-4">
        Requested on: {new Date(request.createdAt).toLocaleDateString()}
        {request.preferredDate && ` | Preferred Date: ${new Date(request.preferredDate).toLocaleDateString()}`}
      </p>
      <div className="text-right">
        {/* Link to a detailed view page - to be implemented later */}
        {/* <Link
          to={`/service-requests/${request.id}`}
          className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
        >
          View Details
        </Link> */}
         <p className="text-xs text-gray-400">Request ID: {request.id}</p>
      </div>
    </div>
  );
};

export default UserRequestListItem;
