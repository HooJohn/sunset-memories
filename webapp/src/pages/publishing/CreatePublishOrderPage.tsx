// Placeholder for CreatePublishOrderPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublishOrderForm from '../../components/publishing/PublishOrderForm';
import { submitPublishOrder, getMemoirById } from '../../services/api'; // To be updated in api.ts
import type { PublishOrderData, Memoir } from '../../services/api'; // 类型导入

const CreatePublishOrderPage: React.FC = () => {
  const { memoirId } = useParams<{ memoirId: string }>();
  const navigate = useNavigate();

  const [memoir, setMemoir] = useState<Memoir | null>(null);
  const [isLoadingMemoir, setIsLoadingMemoir] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!memoirId) {
      setError("Memoir ID not found in URL.");
      setIsLoadingMemoir(false);
      return;
    }
    const fetchMemoirDetails = async () => {
      setIsLoadingMemoir(true);
      setError(null);
      try {
        const memoirData = await getMemoirById(memoirId);
        setMemoir(memoirData);
      } catch (err) {
        console.error('Failed to fetch memoir details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load memoir details.');
      } finally {
        setIsLoadingMemoir(false);
      }
    };
    fetchMemoirDetails();
  }, [memoirId]);

  const handleSubmitOrder = async (formData: Omit<PublishOrderData, 'memoirId'>) => {
    if (!memoirId) {
      setError("Memoir ID is missing for submission.");
      return Promise.reject(new Error("Memoir ID is missing."));
    }
    setIsSubmittingOrder(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const fullOrderData: PublishOrderData = { ...formData, memoirId };
      const newOrder = await submitPublishOrder(fullOrderData);
      setSuccessMessage(`出版订单提交成功！订单ID: ${newOrder.id}。即将跳转页面...`);
      setTimeout(() => {
        navigate('/my-publish-orders'); // Or a specific page for the new order
      }, 3000);
    } catch (err) {
      console.error('Failed to submit publish order:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while submitting the order.');
      throw err; // Re-throw for form to handle its own error state
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (isLoadingMemoir) {
    return <p className="text-center p-10">加载回忆录详情中...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">创建出版订单</h1>

      {error && !isSubmittingOrder && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md text-center mb-6">错误：{error}</p>
      )}
      {successMessage && (
        <p className="text-green-500 bg-green-100 p-3 rounded-md text-center mb-6">{successMessage}</p>
      )}

      {!memoir && !isLoadingMemoir && !error && (
         <p className="text-center text-red-500">无法加载回忆录详情，无法创建出版订单</p>
      )}

      {memoir && !successMessage && ( // Hide form on success
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-indigo-700">出版中: "{memoir.title}"</h2>
            <p className="text-sm text-gray-600">回忆录ID: {memoir.id}</p>
          </div>
          <PublishOrderForm
            onSubmit={handleSubmitOrder}
            isSubmitting={isSubmittingOrder}
            memoirTitle={memoir.title} // Pass title for context in form
          />
        </div>
      )}
    </div>
  );
};

export default CreatePublishOrderPage;
