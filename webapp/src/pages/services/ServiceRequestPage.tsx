import React, { useState } from 'react';
import { useNavigate, useParams } // Import useParams if memoirId might come from route
    from 'react-router-dom';
import ServiceRequestForm from '../../components/services/ServiceRequestForm';
import { submitServiceRequest, CreateServiceRequestPayload } from '../../services/api';

const ServiceRequestPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Example: if memoirId could come from route like /memoirs/:memoirId/request-service
  // const { memoirIdFromRoute } = useParams<{ memoirIdFromRoute?: string }>();
  // For now, assuming general service request, memoirId is optional in the form.

  const handleSubmitRequest = async (formData: CreateServiceRequestPayload): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // If memoirId came from route and should override form, set it here:
      // const payload = { ...formData, memoirId: memoirIdFromRoute || formData.memoirId };
      const newRequest = await submitServiceRequest(formData); // formData now matches CreateServiceRequestPayload
      setSuccessMessage(`Service request submitted successfully! Request ID: ${newRequest.id}. You will be redirected shortly.`);
      setTimeout(() => {
        navigate('/my-requests');
      }, 3000);
    } catch (err) {
      console.error('Failed to submit service request:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      // Re-throw so the form can catch it and potentially display field-specific errors or clear itself
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">Submit a Service Request</h1>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl">
        {/* General error display, though form also has its own error display */}
        {error && !isSubmitting && !successMessage && (
          <p className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900 p-3 rounded-md text-center mb-6">{error}</p>
        )}
        {successMessage && (
          <p className="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 p-3 rounded-md text-center mb-6">{successMessage}</p>
        )}

        {!successMessage && ( // Hide form on success message
            <ServiceRequestForm
                onSubmit={handleSubmitRequest}
                isSubmitting={isSubmitting}
                // Pass memoirId here if it was from route: memoirId={memoirIdFromRoute}
            />
        )}
      </div>
    </div>
  );
};

export default ServiceRequestPage;
