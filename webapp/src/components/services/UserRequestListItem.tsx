import React from 'react';
// import { Link } from 'react-router-dom'; // For future detail view
import { ServiceRequest, ServiceRequestStatus, ServiceType } from '../../services/api';

interface UserRequestListItemProps {
  request: ServiceRequest;
}

// Helper to format enum values to readable strings
const formatServiceType = (type: ServiceType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatStatus = (status: ServiceRequestStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};


const UserRequestListItem: React.FC<UserRequestListItemProps> = ({ request }) => {
  const getStatusColor = (status: ServiceRequestStatus) => {
    switch (status) {
      case ServiceRequestStatus.PENDING: return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-700/30';
      case ServiceRequestStatus.ACCEPTED: return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-700/30';
      case ServiceRequestStatus.IN_PROGRESS: return 'text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-700/30';
      case ServiceRequestStatus.COMPLETED: return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-700/30';
      case ServiceRequestStatus.REJECTED: return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-700/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/30';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2 sm:mb-0">
          Service: {formatServiceType(request.serviceType)}
        </h3>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.status)}`}>
          {formatStatus(request.status)}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        <strong className="font-medium text-gray-900 dark:text-gray-100">Details:</strong> {request.details.substring(0, 150)}{request.details.length > 150 ? '...' : ''}
      </p>
      {request.address && (
        <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong className="font-medium text-gray-900 dark:text-gray-100">Address:</strong> {request.address}
        </p>
      )}
      {request.contactPhone && (
        <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong className="font-medium text-gray-900 dark:text-gray-100">Contact:</strong> {request.contactPhone}
        </p>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        Requested on: {new Date(request.created_at).toLocaleDateString()}
        {request.preferredDate && ` | Preferred: ${new Date(request.preferredDate).toLocaleDateString()}`}
      </p>
      <div className="text-right mt-4">
        {/* Future link to a detailed view page:
        <Link
          to={`/service-requests/${request.id}`}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline font-medium text-sm"
        >
          View Details
        </Link>
        */}
         <p className="text-xs text-gray-400 dark:text-gray-500">Request ID: {request.id}</p>
      </div>
    </div>
  );
};

export default UserRequestListItem;
