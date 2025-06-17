import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPendingInvitations, respondToInvitation, CollaborationStatus } from '../../services/api';
import type { MemoirCollaboration } from '../../services/api';

const PendingInvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<MemoirCollaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{ [key: string]: string | null }>({});
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const fetchInvitations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPendingInvitations();
      setInvitations(data);
    } catch (err) {
      console.error('Failed to fetch pending invitations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invitations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleResponse = async (collaborationId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(prev => ({ ...prev, [collaborationId]: true }));
    setActionError(prev => ({ ...prev, [collaborationId]: null }));
    try {
      await respondToInvitation(collaborationId, { status });
      
      if (status === 'accepted') {
        setInvitations(prev => prev.map(inv =>
          inv.id === collaborationId ? { ...inv, status: CollaborationStatus.ACCEPTED } : inv
        ));
      } else {
        setInvitations(prev => prev.filter(inv => inv.id !== collaborationId));
      }
    } catch (err) {
      console.error(`Failed to ${status} invitation:`, err);
      setActionError(prev => ({ ...prev, [collaborationId]: err instanceof Error ? err.message : `Failed to ${status} invitation.` }));
    } finally {
      setActionLoading(prev => ({ ...prev, [collaborationId]: false }));
    }
  };

  if (isLoading) {
    return <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="dark:text-gray-300 mt-4">Loading invitations...</p></div>;
  }

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900 p-4 rounded-md">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">Pending Collaboration Invitations</h1>

      {invitations.length === 0 && !isLoading && (
        <p className="text-center text-gray-600 dark:text-gray-400">You have no pending invitations.</p>
      )}

      {invitations.length > 0 && (
        <div className="space-y-6">
          {invitations.map(invitation => (
            <div key={invitation.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                Invitation for Memoir: {invitation.memoir?.title || invitation.memoirId}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Invited by: {invitation.user?.nickname || invitation.user?.name || 'User ' + invitation.userId.substring(0,6)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Requested Role: <span className="font-medium capitalize">{invitation.role}</span>
              </p>

              {invitation.status === CollaborationStatus.PENDING && (
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => handleResponse(invitation.id, 'accepted')}
                    disabled={actionLoading[invitation.id]}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm disabled:bg-gray-400"
                  >
                    {actionLoading[invitation.id] ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleResponse(invitation.id, 'rejected')}
                    disabled={actionLoading[invitation.id]}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm disabled:bg-gray-400"
                  >
                    {actionLoading[invitation.id] ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}
              {invitation.status === CollaborationStatus.ACCEPTED && (
                <p className="text-green-600 dark:text-green-400 font-semibold">You have accepted this invitation.</p>
              )}
              {actionError[invitation.id] && <p className="text-red-500 dark:text-red-400 mt-2 text-sm">{actionError[invitation.id]}</p>}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Invitation ID: {invitation.id}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 text-center">
        <Link to="/profile" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          &larr; Back to Profile
        </Link>
      </div>
    </div>
  );
};

export default PendingInvitationsPage;
