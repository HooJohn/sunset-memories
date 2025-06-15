// Placeholder for MemoirCollaboratorsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CollaboratorInviteForm from '../../components/memoirs/CollaboratorInviteForm';
import CollaboratorList from '../../components/memoirs/CollaboratorList';
import { getCollaborators, inviteCollaborator, Collaborator, CollaborationData, updateCollaboratorPermission, removeCollaborator } from '../../services/api'; // To be created in api.ts

const MemoirCollaboratorsPage: React.FC = () => {
  const { id: memoirId } = useParams<{ id: string }>();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = async () => {
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
  };

  useEffect(() => {
    fetchCollaborators();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoirId]);

  const handleInviteCollaborator = async (inviteeEmail: string, permission: 'view' | 'comment' | 'edit') => {
    if (!memoirId) {
      setError("Memoir ID is missing.");
      return;
    }
    setError(null);
    try {
      const newCollaborator = await inviteCollaborator({ memoirId, inviteeEmail, permission });
      setCollaborators(prev => [...prev, newCollaborator]); // Add to local list
      // Optionally, show a success message
    } catch (err) {
      console.error('Failed to invite collaborator:', err);
      setError(err instanceof Error ? err.message : 'Failed to invite collaborator.');
      // Optionally, show error message to user in the form
      throw err; // Re-throw to allow form to handle its own error state
    }
  };

  const handleUpdatePermission = async (collaborationId: string, newPermission: 'view' | 'comment' | 'edit') => {
    setError(null);
    try {
        const updatedCollaborator = await updateCollaboratorPermission(collaborationId, newPermission);
        setCollaborators(prev => prev.map(c => c.id === collaborationId ? updatedCollaborator : c));
    } catch (err) {
        console.error('Failed to update permission:', err);
        setError(err instanceof Error ? err.message : 'Failed to update permission.');
    }
  };

  const handleRemoveCollaborator = async (collaborationId: string) => {
    setError(null);
    try {
        await removeCollaborator(collaborationId);
        setCollaborators(prev => prev.filter(c => c.id !== collaborationId));
    } catch (err) {
        console.error('Failed to remove collaborator:', err);
        setError(err instanceof Error ? err.message : 'Failed to remove collaborator.');
    }
  };


  if (!memoirId) {
    return <div className="p-4 text-red-500 text-center">Memoir ID not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Collaborators for Memoir ID: {memoirId}</h1>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md text-center mb-4">{error}</p>}

      <div className="grid md:grid-cols-2 gap-8">
        <section className="p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Invite New Collaborator</h2>
          <CollaboratorInviteForm onSubmit={handleInviteCollaborator} />
        </section>

        <section className="p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Current Collaborators</h2>
          {isLoading ? (
            <p>Loading collaborators...</p>
          ) : collaborators.length > 0 ? (
            <CollaboratorList
              collaborators={collaborators}
              onUpdatePermission={handleUpdatePermission}
              onRemoveCollaborator={handleRemoveCollaborator}
            />
          ) : (
            <p>No collaborators yet for this memoir.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default MemoirCollaboratorsPage;
