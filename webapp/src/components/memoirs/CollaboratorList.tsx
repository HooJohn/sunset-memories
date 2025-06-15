// Placeholder for CollaboratorList.tsx
import React, { useState } from 'react';
import { Collaborator } from '../../services/api'; // To be created in api.ts

type PermissionLevel = 'view' | 'comment' | 'edit';

interface CollaboratorListProps {
  collaborators: Collaborator[];
  onUpdatePermission: (collaborationId: string, newPermission: PermissionLevel) => Promise<void>;
  onRemoveCollaborator: (collaborationId: string) => Promise<void>;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({ collaborators, onUpdatePermission, onRemoveCollaborator }) => {
  const [editingCollaboratorId, setEditingCollaboratorId] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<PermissionLevel>('view');
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({}); // For individual row operations

  const handleEditClick = (collaborator: Collaborator) => {
    setEditingCollaboratorId(collaborator.id);
    setSelectedPermission(collaborator.permission);
  };

  const handleSavePermission = async (collaboratorId: string) => {
    setIsLoading(prev => ({ ...prev, [collaboratorId]: true }));
    try {
      await onUpdatePermission(collaboratorId, selectedPermission);
      setEditingCollaboratorId(null); // Exit edit mode
    } catch (error) {
      // Error handling can be done in the parent or here
      console.error("Failed to save permission from list item:", error);
      alert(`Error updating permission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [collaboratorId]: false }));
    }
  };

  const handleRemoveClick = async (collaboratorId: string) => {
    if (window.confirm("Are you sure you want to remove this collaborator?")) {
        setIsLoading(prev => ({ ...prev, [collaboratorId]: true }));
        try {
            await onRemoveCollaborator(collaboratorId);
        } catch (error) {
            console.error("Failed to remove collaborator from list item:", error);
            alert(`Error removing collaborator: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(prev => ({ ...prev, [collaboratorId]: false }));
        }
    }
  };


  if (collaborators.length === 0) {
    return <p className="text-gray-600">No collaborators found.</p>;
  }

  return (
    <ul className="space-y-4">
      {collaborators.map((collaborator) => (
        <li key={collaborator.id} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-2 sm:mb-0">
            <p className="font-semibold text-gray-800">{collaborator.nickname || collaborator.email}</p>
            <p className="text-sm text-gray-600">Email: {collaborator.email}</p>
            {editingCollaboratorId === collaborator.id ? (
              <div className="mt-2">
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value as PermissionLevel)}
                  className="block w-full sm:w-auto px-2 py-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={isLoading[collaborator.id]}
                >
                  <option value="view">View</option>
                  <option value="comment">Comment</option>
                  <option value="edit">Edit</option>
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Permission: <span className="font-medium capitalize">{collaborator.permission}</span></p>
            )}
          </div>
          <div className="flex space-x-2 mt-2 sm:mt-0 self-start sm:self-center">
            {editingCollaboratorId === collaborator.id ? (
              <>
                <button
                  onClick={() => handleSavePermission(collaborator.id)}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded disabled:bg-gray-400"
                  disabled={isLoading[collaborator.id]}
                >
                  {isLoading[collaborator.id] ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingCollaboratorId(null)}
                  className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-1 px-2 rounded"
                  disabled={isLoading[collaborator.id]}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => handleEditClick(collaborator)}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded disabled:bg-gray-400"
                disabled={isLoading[collaborator.id]}
              >
                Change Permission
              </button>
            )}
            <button
              onClick={() => handleRemoveClick(collaborator.id)}
              className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded disabled:bg-gray-400"
              disabled={isLoading[collaborator.id] || editingCollaboratorId === collaborator.id}
            >
              {isLoading[collaborator.id] && editingCollaboratorId !== collaborator.id ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CollaboratorList;
