// Placeholder for UserPublishOrderItem.tsx
import React from 'react';
// import { Link } from 'react-router-dom'; // If linking to detailed order view
import { PublishOrder, PublishOrderStatus } from '../../services/api'; // To be updated in api.ts

interface UserPublishOrderItemProps {
  order: PublishOrder;
}

const UserPublishOrderItem: React.FC<UserPublishOrderItemProps> = ({ order }) => {
  const getStatusColor = (status: PublishOrderStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'awaiting_payment': return 'text-blue-600 bg-blue-100';
      case 'in_production': return 'text-indigo-600 bg-indigo-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // In a real app, you might fetch memoir details if only memoirId is stored in order.
  // For now, assuming order might contain memoirTitle or similar, or we just show ID.
  // The current PublishOrder interface doesn't have memoirTitle, so we'll show memoirId.

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <h3 className="text-xl font-semibold text-indigo-700 mb-2 sm:mb-0">
          Order ID: {order.id}
        </h3>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
          Status: {order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>
      <p className="text-gray-700 mb-2">
        <strong className="font-medium">Memoir ID:</strong> {order.memoirId}
        {/* Ideal: <strong className="font-medium">Memoir Title:</strong> {order.memoirTitle || order.memoirId} */}
      </p>
      <p className="text-gray-700 mb-2">
        <strong className="font-medium">Format:</strong> <span className="capitalize">{order.format}</span>
      </p>
      {order.format !== 'ebook' && (
        <p className="text-gray-700 mb-2">
          <strong className="font-medium">Quantity:</strong> {order.quantity}
        </p>
      )}
      {order.shippingAddress && (
        <p className="text-gray-700 mb-2">
          <strong className="font-medium">Shipping Address:</strong> {order.shippingAddress}
        </p>
      )}
      <p className="text-sm text-gray-500 mb-4">
        Ordered on: {new Date(order.createdAt).toLocaleDateString()}
      </p>
      {order.estimatedDeliveryDate && (
        <p className="text-sm text-gray-500 mb-2">
          <strong className="font-medium">Est. Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
        </p>
      )}
      {order.trackingNumber && (
        <p className="text-sm text-gray-500 mb-2">
          <strong className="font-medium">Tracking #:</strong> {order.trackingNumber}
        </p>
      )}
      {order.notes && (
        <p className="text-sm text-gray-500 italic mt-2">
          <strong className="font-medium not-italic">Notes:</strong> {order.notes}
        </p>
      )}
      <div className="text-right mt-4">
        {/* Link to a detailed view page - to be implemented later */}
        {/* <Link
          to={`/publish-orders/${order.id}`}
          className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
        >
          View Details
        </Link> */}
      </div>
    </div>
  );
};

export default UserPublishOrderItem;
