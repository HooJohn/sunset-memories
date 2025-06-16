import React, { useState } from 'react';
import { MemoirCollaboration, CollaborationRole } from '../../services/api'; // Use new types

interface CollaboratorListProps {
  collaborators: MemoirCollaboration[];
  onUpdateRole: (collaborationId: string, newRole: CollaborationRole) => Promise<void>; // Changed prop name
  onRemoveCollaborator: (collaborationId: string) => Promise<void>;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({ collaborators, onUpdateRole, onRemoveCollaborator }) => {
  const [editingCollaboratorId, setEditingCollaboratorId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<CollaborationRole>(CollaborationRole.VIEWER);
  // For individual row operations (e.g. specific save/remove button is loading)
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: { save?: boolean; remove?: boolean } }>({});

  const handleEditClick = (collaborator: MemoirCollaboration) => {
    setEditingCollaboratorId(collaborator.id);
    setSelectedRole(collaborator.role);
  };

  const handleSaveRole = async (collaborationId: string) => {
    setLoadingStates(prev => ({ ...prev, [collaborationId]: { ...prev[collaborationId], save: true } }));
    try {
      await onUpdateRole(collaborationId, selectedRole);
      setEditingCollaboratorId(null);
    } catch (error) {
      console.error("Failed to save role from list item:", error);
      alert(`Error updating role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [collaborationId]: { ...prev[collaborationId], save: false } }));
    }
  };

  const handleRemoveClick = async (collaborationId: string) => {
    if (window.confirm("Are you sure you want to remove this collaborator?")) {
        setLoadingStates(prev => ({ ...prev, [collaborationId]: { ...prev[collaborationId], remove: true } }));
        try {
            await onRemoveCollaborator(collaborationId);
            // Item will be removed from list by parent state update
        } catch (error) {
            console.error("Failed to remove collaborator from list item:", error);
            alert(`Error removing collaborator: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoadingStates(prev => ({ ...prev, [collaborationId]: { ...prev[collaborationId], remove: false } }));
        }
    }
  };

  if (collaborators.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400">No collaborators found for this memoir.</p>;
  }

  return (
    <ul className="space-y-4">
      {collaborators.map((collaborator) => {
        const collaboratorUser = collaborator.user; // User details are nested
        const currentLoadingState = loadingStates[collaborator.id] || {};

        return (
            <li key={collaborator.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                {collaboratorUser?.nickname || collaboratorUser?.name || collaboratorUser?.phone || 'Unknown User'}
                </p>
                {collaboratorUser?.phone && <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {collaboratorUser.phone}</p>}
                {/* Display other user details if needed, e.g., email if available and privacy allows */}

                {editingCollaboratorId === collaborator.id ? (
                <div className="mt-2">
                    <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as CollaborationRole)}
                    className="block w-full sm:w-auto px-2 py-1 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={currentLoadingState.save}
                    >
                    {Object.values(CollaborationRole).map((roleValue) => (
                        <option key={roleValue} value={roleValue}>
                        {roleValue.charAt(0).toUpperCase() + roleValue.slice(1)}
                        </option>
                    ))}
                    </select>
                </div>
                ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Role: <span className="font-medium capitalize">{collaborator.role}</span>
                    {collaborator.status === CollaborationStatus.PENDING && <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Pending)</span>}
                </p>
                )}
            </div>
            <div className="flex space-x-2 mt-3 sm:mt-0 self-start sm:self-center flex-shrink-0">
                {editingCollaboratorId === collaborator.id ? (
                <>
                    <button
                    type="button"
                    onClick={() => handleSaveRole(collaborator.id)}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded disabled:bg-gray-400"
                    disabled={currentLoadingState.save}
                    >
                    {currentLoadingState.save ? 'Saving...' : 'Save Role'}
                    </button>
                    <button
                    type="button"
                    onClick={() => setEditingCollaboratorId(null)}
                    className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-3 rounded"
                    disabled={currentLoadingState.save}
                    >
                    Cancel
                    </button>
                </>
                ) : (
                <button
                    type="button"
                    onClick={() => handleEditClick(collaborator)}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded disabled:bg-gray-400"
                    disabled={currentLoadingState.remove || currentLoadingState.save}
                >
                    Change Role
                </button>
                )}
                <button
                type="button"
                onClick={() => handleRemoveClick(collaborator.id)}
                className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded disabled:bg-gray-400"
                disabled={currentLoadingState.remove || currentLoadingState.save || editingCollaboratorId === collaborator.id}
                >
                {currentLoadingState.remove ? 'Removing...' : 'Remove'}
                </button>
            </div>
            </li>
        );
      })}
    </ul>
  );
};

export default CollaboratorList;
