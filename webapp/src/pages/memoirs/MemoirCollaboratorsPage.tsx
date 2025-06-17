import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import CollaboratorInviteForm from '../../components/memoirs/CollaboratorInviteForm';
import CollaboratorList from '../../components/memoirs/CollaboratorList';
import {
    getCollaborators,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    CollaborationRole
} from '../../services/api';
import type { MemoirCollaboration, InviteCollaboratorPayload } from '../../services/api'; // Fixed type imports

const MemoirCollaboratorsPage: React.FC = () => {
  const { id: memoirId } = useParams<{ id: string }>();
  const [collaborators, setCollaborators] = useState<MemoirCollaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemoirCollaborators = useCallback(async () => {
    if (!memoirId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCollaborators(memoirId);
      setCollaborators(data);
    } catch (err) {
      console.error('Failed to fetch collaborators:', err);
      setError(err instanceof Error ? err.message : 'Failed to load collaborators.');
    } finally {
      setIsLoading(false);
    }
  }, [memoirId]);

  useEffect(() => {
    fetchMemoirCollaborators();
  }, [fetchMemoirCollaborators]);

  const handleInviteCollaborator = async (payload: Omit<InviteCollaboratorPayload, 'memoirId'>) => {
    if (!memoirId) {
      setError("Memoir ID is missing.");
      throw new Error("Memoir ID is missing.");
    }
    setError(null);
    try {
      const newCollaborator = await inviteCollaborator(memoirId, payload);
      setCollaborators(prev => [...prev, newCollaborator]);
    } catch (err) {
      console.error('Failed to invite collaborator:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to invite collaborator.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleUpdateRole = async (collaborationId: string, newRole: CollaborationRole) => {
    setError(null);
    try {
        const updatedCollaborator = await updateCollaboratorRole(collaborationId, newRole);
        setCollaborators(prev => prev.map(c => c.id === collaborationId ? { ...c, ...updatedCollaborator } : c));
    } catch (err) {
        console.error('Failed to update role:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to update role.';
        setError(errorMessage);
        alert(`Error: ${errorMessage}`);
    }
  };

  const handleRemoveCollaborator = async (collaborationId: string) => {
    setError(null);
    if (window.confirm('Are you sure you want to remove this collaborator?')) {
        try {
            await removeCollaborator(collaborationId);
            setCollaborators(prev => prev.filter(c => c.id !== collaborationId));
        } catch (err) {
            console.error('Failed to remove collaborator:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove collaborator.';
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
        }
    }
  };

  if (!memoirId) {
    return <div className="p-4 text-red-500 dark:text-red-400 text-center">Memoir ID not found in URL.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-gray-200">
        Manage Collaborators
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
        For Memoir: {memoirId}
      </p>

      {error && <p className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900 p-3 rounded-md text-center mb-4">{error}</p>}

      <div className="grid md:grid-cols-2 gap-8">
        <section className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400">Invite New Collaborator</h2>
          <CollaboratorInviteForm onSubmit={handleInviteCollaborator} />
        </section>

        <section className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400">Current Collaborators</h2>
          {isLoading ? (
            <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="dark:text-gray-300 mt-2">Loading collaborators...</p>
            </div>
          ) : collaborators.length > 0 ? (
            <CollaboratorList
              collaborators={collaborators}
              onUpdateRole={handleUpdateRole}
              onRemoveCollaborator={handleRemoveCollaborator}
            />
          ) : (
            <p className="dark:text-gray-300">No collaborators yet for this memoir.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default MemoirCollaboratorsPage;
