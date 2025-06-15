import React, { useState } from 'react';
import { CollaborationRole, InviteCollaboratorPayload } from '../../services/api'; // Import new types

interface CollaboratorInviteFormProps {
  // onSubmit now matches the structure of api.inviteCollaborator payload, memoirId is handled by parent
  onSubmit: (payload: Omit<InviteCollaboratorPayload, 'memoirId'>) => Promise<void>;
}

const CollaboratorInviteForm: React.FC<CollaboratorInviteFormProps> = ({ onSubmit }) => {
  const [collaboratorPhone, setCollaboratorPhone] = useState('');
  const [role, setRole] = useState<CollaborationRole>(CollaborationRole.VIEWER); // Use enum
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!collaboratorPhone.trim()) {
      setError('Collaborator phone number is required.');
      return;
    }
    // Basic phone validation (example: very simple, consider a library for robust validation)
    if (!/^\+?[0-9\s-()]{7,20}$/.test(collaboratorPhone)) {
        setError('Please enter a valid phone number (e.g., +1234567890).');
        return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ collaboratorPhone, role });
      setSuccessMessage(`Invitation sent to ${collaboratorPhone} with ${role} role.`);
      setCollaboratorPhone(''); // Reset form
      setRole(CollaborationRole.VIEWER);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm p-3 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-md">{error}</p>}
      {successMessage && <p className="text-green-500 text-sm p-3 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-md">{successMessage}</p>}

      <div>
        <label htmlFor="collaboratorPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Collaborator's Phone Number
        </label>
        <input
          type="tel" // Changed type to tel
          id="collaboratorPhone"
          name="collaboratorPhone"
          value={collaboratorPhone}
          onChange={(e) => setCollaboratorPhone(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Enter phone number to invite"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as CollaborationRole)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        >
          {/* Iterate over CollaborationRole enum values */}
          {Object.values(CollaborationRole).map((roleValue) => (
            <option key={roleValue} value={roleValue}>
              {roleValue.charAt(0).toUpperCase() + roleValue.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
        >
          {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
        </button>
      </div>
    </form>
  );
};

export default CollaboratorInviteForm;
