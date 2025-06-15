// Placeholder for ServiceRequestForm.tsx
import React, { useState } from 'react';
import { ServiceRequestData } from '../../services/api'; // Assuming this will be defined in api.ts

interface ServiceRequestFormProps {
  onSubmit: (formData: ServiceRequestData) => Promise<void>;
  isSubmitting: boolean; // Controlled by parent
  initialData?: Partial<ServiceRequestData>; // For editing later, if needed
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({ onSubmit, isSubmitting, initialData = {} }) => {
  const [type, setType] = useState(initialData.type || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [contactPhone, setContactPhone] = useState(initialData.contactPhone || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [preferredDate, setPreferredDate] = useState(initialData.preferredDate || '');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!type.trim()) {
      setFormError('Service type is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Description is required.');
      return;
    }
    if (!contactPhone.trim()) {
      setFormError('Contact phone is required.');
      return;
    }
    if (!/^\+?[0-9\s-()]{7,20}$/.test(contactPhone)) {
        setFormError('Please enter a valid phone number.');
        return;
    }
    if (!address.trim()) {
      setFormError('Address is required.');
      return;
    }

    const formData: ServiceRequestData = {
      type,
      description,
      contactPhone,
      address,
      preferredDate: preferredDate || undefined, // Send undefined if empty, not an empty string
    };

    try {
      await onSubmit(formData);
      // Reset form on successful submission by parent, or parent can manage this.
      // For now, parent handles success message and redirection.
      // If we want to reset here:
      // setType(''); setDescription(''); setContactPhone(''); setAddress(''); setPreferredDate('');
    } catch (error) {
      // Error is handled by parent, but we can set a local form error if needed
      setFormError(error instanceof Error ? error.message : "Submission failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <p className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{formError}</p>}

      <div>
        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
          Type of Service
        </label>
        <input
          type="text"
          id="serviceType"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Plumbing, Electrical, Tutoring"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description of Needs
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Please describe the issue or service you require in detail."
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
          Contact Phone
        </label>
        <input
          type="tel"
          id="contactPhone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Your phone number"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Street address, City, State, Zip Code"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700">
          Preferred Date (Optional)
        </label>
        <input
          type="date"
          id="preferredDate"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default ServiceRequestForm;
