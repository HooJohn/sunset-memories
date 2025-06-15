import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { fetchUserProfile } from '../../services/api'; // Assuming you will add this to api.ts

// Placeholder for user data structure
interface UserProfile {
  id: string;
  phone: string;
  nickname: string;
  // Add other fields like createdAt, etc., as needed from your backend
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // const token = localStorage.getItem('authToken');
        // if (!token) {
        //   navigate('/login');
        //   return;
        // }
        //
        // // Placeholder: Replace with actual API call
        // // const profileData = await fetchUserProfile(); // This function needs to be created in api.ts
        // // setUser(profileData);

        // Simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockUser: UserProfile = {
          id: '123',
          phone: '123-456-7890', // This would come from the backend
          nickname: 'MockUser', // This would also come from the backend
        };
        setUser(mockUser);

      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again later.');
        // Optional: If token is invalid or expired, redirect to login
        // if (err.response && err.response.status === 401) {
        //   localStorage.removeItem('authToken');
        //   navigate('/login');
        // }
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear the token
    navigate('/login'); // Redirect to login page
  };

  if (loading) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-10">No user data found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">User Profile</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nickname:</p>
              <p className="text-lg text-gray-900">{user.nickname}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number:</p>
              <p className="text-lg text-gray-900">{user.phone}</p>
            </div>
            {/* Add more user details here as they become available */}
            {/* Example:
            <div>
              <p className="text-sm font-medium text-gray-500">User ID:</p>
              <p className="text-lg text-gray-900">{user.id}</p>
            </div>
            */}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
