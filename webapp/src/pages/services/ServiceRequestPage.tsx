// Placeholder for ServiceRequestPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceRequestForm from '../../components/services/ServiceRequestForm';
import { submitServiceRequest, ServiceRequestData, ServiceRequest } from '../../services/api'; // To be created/updated in api.ts

const ServiceRequestPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmitRequest = async (formData: ServiceRequestData): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const newRequest = await submitServiceRequest(formData);
      setSuccessMessage(`Service request submitted successfully! Request ID: ${newRequest.id}. You will be redirected shortly.`);
      // Redirect to user's request list or a confirmation page after a delay
      setTimeout(() => {
        navigate('/my-requests'); // Or a specific page for the new request
      }, 3000);
    } catch (err) {
      console.error('Failed to submit service request:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      throw err; // Re-throw to allow form to handle its own error state if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Submit a Service Request</h1>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        {error && !isSubmitting && ( // Show general errors here if not handled by form
          <p className="text-red-500 bg-red-100 p-3 rounded-md text-center mb-6">{error}</p>
        )}
        {successMessage && (
          <p className="text-green-500 bg-green-100 p-3 rounded-md text-center mb-6">{successMessage}</p>
        )}
        {!successMessage && ( // Hide form on success message
            <ServiceRequestForm
                onSubmit={handleSubmitRequest}
                isSubmitting={isSubmitting}
            />
        )}
      </div>
    </div>
  );
};

export default ServiceRequestPage;
