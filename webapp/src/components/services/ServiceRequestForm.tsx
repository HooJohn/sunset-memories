import React, { useState } from 'react';
import { ServiceType } from '../../services/api';
import type { CreateServiceRequestPayload } from '../../services/api';

interface ServiceRequestFormProps {
  onSubmit: (formData: CreateServiceRequestPayload) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Partial<CreateServiceRequestPayload>;
  // Optional memoirId if form is used in a context where memoir is pre-selected
  memoirId?: string;
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
    onSubmit,
    isSubmitting,
    initialData = {},
    memoirId
}) => {
  const [serviceType, setServiceType] = useState<ServiceType>(initialData.serviceType || ServiceType.OTHER);
  const [description, setDescription] = useState(initialData.description || '');
  const [contactPhone, setContactPhone] = useState(initialData.contactPhone || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [preferredDate, setPreferredDate] = useState(initialData.preferredDate || '');
  // memoirId from prop will be used if provided, otherwise user can input it if field is added
  const [formMemoirId, setFormMemoirId] = useState(initialData.memoirId || memoirId || '');

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

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
    // memoirId could be optional globally, but required by specific service types,
    // or always optional. For now, it's optional in the form.
    // if (!formMemoirId && (serviceType === ServiceType.EDITING_ASSISTANCE || serviceType === ServiceType.PUBLISHING_GUIDANCE)) {
    //   setFormError('Memoir ID is required for this service type.');
    //   return;
    // }


    const formData: CreateServiceRequestPayload = {
      serviceType,
      description,
      contactPhone,
      address,
      preferredDate: preferredDate || undefined,
      memoirId: formMemoirId.trim() === '' ? undefined : formMemoirId.trim(),
    };

    try {
      await onSubmit(formData);
      // Reset form if needed, parent currently handles redirection/success message
      // setServiceType(ServiceType.OTHER); setDescription(''); setContactPhone('');
      // setAddress(''); setPreferredDate(''); setFormMemoirId('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Submission failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <p className="text-red-500 text-sm p-3 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-md">{formError}</p>}

      <div>
        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type of Service <span className="text-red-500">*</span>
        </label>
        <select
          id="serviceType"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value as ServiceType)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        >
          {Object.values(ServiceType).map(typeValue => (
            <option key={typeValue} value={typeValue}>
              {typeValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Optional Memoir ID field if not passed as prop or pre-determined */}
      {!memoirId && ( // Only show if memoirId is not fixed by parent context
        <div>
            <label htmlFor="formMemoirId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Memoir ID (Optional)
            </label>
            <input
            type="text"
            id="formMemoirId"
            value={formMemoirId}
            onChange={(e) => setFormMemoirId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Link a specific memoir (optional)"
            disabled={isSubmitting}
            />
        </div>
      )}


      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description of Needs <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Please describe the issue or service you require in detail."
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Contact Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="contactPhone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Your phone number"
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Street address, City, State, Zip Code"
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preferred Date (Optional)
        </label>
        <input
          type="date"
          id="preferredDate"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          disabled={isSubmitting}
          min={new Date().toISOString().split("T")[0]} // Prevent past dates
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
        >
          {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default ServiceRequestForm;
