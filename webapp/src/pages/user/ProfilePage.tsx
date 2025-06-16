import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile, User } from '../../services/api';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickname, setNickname] = useState(''); // Add nickname state for editing
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login'); // Redirect if no token
        return;
      }
      try {
        const profileData = await fetchUserProfile();
        setUser(profileData);
        setName(profileData.name || '');
        setAvatarUrl(profileData.avatar_url || '');
        setNickname(profileData.nickname || ''); // Set nickname from fetched data
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('Authentication token not found'))) {
            localStorage.removeItem('authToken'); // Clear invalid token
            navigate('/login');
        } else {
            setError(err instanceof Error ? err.message : 'Failed to load profile.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadUserProfile();
  }, [navigate]);

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      // Only send fields that are meant to be updated by the user.
      // Backend should handle partial updates.
      const updatedUserData = await updateUserProfile({
        name: name.trim() === '' ? undefined : name,
        avatar_url: avatarUrl.trim() === '' ? undefined : avatarUrl,
        nickname: nickname.trim() === '' ? undefined : nickname, // Include nickname in update
      });
      setUser(updatedUserData); // Update local user state with response from backend
      setName(updatedUserData.name || '');
      setAvatarUrl(updatedUserData.avatar_url || '');
      setNickname(updatedUserData.nickname || '');
      setUpdateSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setUpdateError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (isLoading) {
    return <div className="text-center p-10 text-xl">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500 bg-red-100 rounded-md shadow">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-10 text-gray-700">No user data found. Something went wrong.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="flex flex-col items-center">
              {avatarUrl ? (
                <img className="h-32 w-32 rounded-full object-cover shadow-lg mb-4 border-4 border-indigo-500 dark:border-indigo-400" src={avatarUrl} alt={name || user.nickname || 'User Avatar'} />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 text-4xl font-semibold mb-4 shadow-lg border-4 border-indigo-500 dark:border-indigo-400">
                  {(name || user.nickname || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
                {user.nickname || 'User Profile'}
              </h2>
              <p className="mt-1 text-md text-gray-500 dark:text-gray-400">ID: {user.id}</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="mt-10 space-y-8">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number (Read-only)
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={user.phone}
                  readOnly
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="nicknameEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nickname
                </label>
                <input
                  type="text"
                  id="nicknameEdit"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              {updateError && <p className="text-sm text-red-600 dark:text-red-400 text-center py-2 px-3 bg-red-50 dark:bg-red-900 rounded-md">{updateError}</p>}
              {updateSuccess && <p className="text-sm text-green-600 dark:text-green-400 text-center py-2 px-3 bg-green-50 dark:bg-green-900 rounded-md">{updateSuccess}</p>}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-700"
                >
                  {isUpdating ? 'Updating Profile...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
