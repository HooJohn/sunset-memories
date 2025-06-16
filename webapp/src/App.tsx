import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/user/ProfilePage';
// Memoir Pages
import CreateMemoirPage from './pages/memoirs/CreateMemoirPage';
import EditMemoirPage from './pages/memoirs/EditMemoirPage';
import MemoirCollaboratorsPage from './pages/memoirs/MemoirCollaboratorsPage';
// Service Request Pages
import ServiceRequestPage from './pages/services/ServiceRequestPage';
import UserRequestsListPage from './pages/services/UserRequestsListPage';
// Publishing Order Pages
import CreatePublishOrderPage from './pages/publishing/CreatePublishOrderPage';
import UserPublishOrdersPage from './pages/publishing/UserPublishOrdersPage';
// Community Pages
import CommunityPage from './pages/community/CommunityPage';
import ViewMemoirPage from './pages/community/ViewMemoirPage';
// User specific pages
import PendingInvitationsPage from './pages/user/PendingInvitationsPage'; // New import

import './App.css'; // Assuming you still want App.css for global styles not covered by Tailwind

// A simple placeholder for a home page component
const HomePage: React.FC = () => (
  <div className="text-center p-10">
    <h2 className="text-3xl font-bold mb-4">Home Page</h2>
    <p className="mb-6">Welcome to the application!</p>
    <nav>
      <ul className="space-y-2">
        <li><Link to="/login" className="text-blue-500 hover:underline">Login</Link></li>
        <li><Link to="/register" className="text-blue-500 hover:underline">Register</Link></li>
        <li><Link to="/profile" className="text-blue-500 hover:underline">Profile</Link></li>
        <li><Link to="/my-invitations" className="text-blue-500 hover:underline">My Invitations</Link></li> {/* New Link */}

        <hr className="my-3 border-gray-300"/>
        <li className="text-gray-500 text-sm uppercase">Memoirs</li>
        <li><Link to="/memoirs/create" className="text-green-500 hover:underline">Create New Memoir</Link></li>
        <li><Link to="/memoirs/edit/123" className="text-yellow-600 hover:underline">Edit Memoir (ID 123)</Link></li>
        <li><Link to="/memoirs/123/collaborators" className="text-purple-600 hover:underline">Manage Collaborators (Memoir ID 123)</Link></li>
        <li><Link to="/memoirs/123/publish" className="text-red-500 hover:underline">Publish Memoir (ID 123)</Link></li>


        <hr className="my-3 border-gray-300"/>
        <li className="text-gray-500 text-sm uppercase">Service Requests</li>
        <li><Link to="/services/request" className="text-teal-500 hover:underline">Submit Service Request</Link></li>
        <li><Link to="/my-requests" className="text-cyan-500 hover:underline">My Service Requests</Link></li>

        <hr className="my-3 border-gray-300"/>
        <li className="text-gray-500 text-sm uppercase">Publishing</li>
        <li><Link to="/my-publish-orders" className="text-pink-500 hover:underline">My Publish Orders</Link></li>

        <hr className="my-3 border-gray-300"/>
        <li className="text-gray-500 text-sm uppercase">Community</li>
        <li><Link to="/community" className="text-orange-500 hover:underline">Community Feed</Link></li>
        <li><Link to="/community/memoirs/sample-public-id" className="text-lime-500 hover:underline">View Sample Public Memoir</Link></li>
      </ul>
    </nav>
  </div>
);

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-invitations" element={<PendingInvitationsPage />} /> {/* New Route */}

          {/* Memoir Routes */}
          <Route path="/memoirs/create" element={<CreateMemoirPage />} />
          <Route path="/memoirs/edit/:id" element={<EditMemoirPage />} />
          <Route path="/memoirs/:id/collaborators" element={<MemoirCollaboratorsPage />} />
          <Route path="/memoirs/:memoirId/publish" element={<CreatePublishOrderPage />} />

          {/* Service Request Routes */}
          <Route path="/services/request" element={<ServiceRequestPage />} />
          <Route path="/my-requests" element={<UserRequestsListPage />} />

          {/* Publishing Order Routes */}
          <Route path="/my-publish-orders" element={<UserPublishOrdersPage />} />

          {/* Community Routes */}
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/memoirs/:id" element={<ViewMemoirPage />} />


          {/* You can add more routes here, for example, a 404 page */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
