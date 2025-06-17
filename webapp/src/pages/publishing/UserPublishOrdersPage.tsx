// Placeholder for UserPublishOrdersPage.tsx
import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom'; // If needed for linking to specific orders
import UserPublishOrderItem from '../../components/publishing/UserPublishOrderItem';
import { getUserPublishOrders } from '../../services/api'; // To be updated in api.ts
import type { PublishOrder } from '../../services/api'; // 类型导入

const UserPublishOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<PublishOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserPublishOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch publish orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load publish orders.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">我的出版订单</h1>
        {/* Optional: Link to a general publishing info page or memoir list to start a new order */}
        {/* <Link
          to="/memoirs" // Example: link to a page where user can select a memoir to publish
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create New Publish Order
        </Link> */}
      </div>

      {isLoading && <p className="text-center text-gray-600">正在加载您的出版订单...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">错误：{error}</p>}

      {!isLoading && !error && orders.length === 0 && (
        <p className="text-center text-gray-600">您尚未创建任何出版订单</p>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map(order => (
            <UserPublishOrderItem key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPublishOrdersPage;
