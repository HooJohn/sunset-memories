// Placeholder for CollaboratorInviteForm.tsx
import React, { useState } from 'react';

type PermissionLevel = 'view' | 'comment' | 'edit';

interface CollaboratorInviteFormProps {
  onSubmit: (inviteeEmail: string, permission: PermissionLevel) => Promise<void>;
}

const CollaboratorInviteForm: React.FC<CollaboratorInviteFormProps> = ({ onSubmit }) => {
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [permission, setPermission] = useState<PermissionLevel>('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!inviteeEmail.trim()) {
      setError('Email or username is required.');
      return;
    }
    // Basic email validation regex (optional, can be more complex)
    if (!/\S+@\S+\.\S+/.test(inviteeEmail)) {
        setError('Please enter a valid email address.');
        return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(inviteeEmail, permission);
      setSuccessMessage(`Invitation sent to ${inviteeEmail} with ${permission} permission.`);
      setInviteeEmail(''); // Reset form
      setPermission('view');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</p>}
      {successMessage && <p className="text-green-500 text-sm p-3 bg-green-100 rounded-md">{successMessage}</p>}

      <div>
        <label htmlFor="inviteeEmail" className="block text-sm font-medium text-gray-700">
          User's Email
        </label>
        <input
          type="email"
          id="inviteeEmail"
          name="inviteeEmail"
          value={inviteeEmail}
          onChange={(e) => setInviteeEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter email to invite"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="permission" className="block text-sm font-medium text-gray-700">
          Permission Level
        </label>
        <select
          id="permission"
          name="permission"
          value={permission}
          onChange={(e) => setPermission(e.target.value as PermissionLevel)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isSubmitting}
        >
          <option value="view">View</option>
          <option value="comment">Comment</option>
          <option value="edit">Edit</option>
        </select>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
        </button>
      </div>
    </form>
  );
};

export default CollaboratorInviteForm;
