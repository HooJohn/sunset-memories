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
  <div className="text-center p-4 sm:p-6 md:p-10">
    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-senior-friendly-primary">🌟 记录您的故事，分享您的回忆</h2>
    <p className="mb-8 text-base sm:text-lg text-senior-friendly-text">一个专为老年用户设计的平台，旨在帮助他们轻松记录、整理和分享自己的回忆录。</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
      {/* Card 1: Create Memoir */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-senior-friendly-primary">创建回忆录</h3>
        <p className="text-sm sm:text-base mb-4 text-senior-friendly-text-light text-center">通过简单的步骤，开始撰写您的第一篇回忆录。</p>
        <Link
          to="/memoirs/create"
          className="w-full sm:w-auto bg-senior-friendly-primary text-white px-8 py-3 rounded-lg hover:bg-senior-friendly-primary-hover text-base sm:text-lg font-medium transition-colors duration-150 ease-in-out"
        >
          开始创作
        </Link>
      </div>
      {/* Card 2: Community Share */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-senior-friendly-primary">社区分享</h3>
        <p className="text-sm sm:text-base mb-4 text-senior-friendly-text-light text-center">浏览社区中的其他回忆录，与他人分享您的故事。</p>
        <Link
          to="/community"
          className="w-full sm:w-auto bg-senior-friendly-primary text-white px-8 py-3 rounded-lg hover:bg-senior-friendly-primary-hover text-base sm:text-lg font-medium transition-colors duration-150 ease-in-out"
        >
          进入社区
        </Link>
      </div>
      {/* Card 3: Seek Help */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-senior-friendly-primary">寻求帮助</h3>
        <p className="text-sm sm:text-base mb-4 text-senior-friendly-text-light text-center">需要帮助？我们可以提供写作、编辑等服务。</p>
        <Link
          to="/services/request"
          className="w-full sm:w-auto bg-senior-friendly-primary text-white px-8 py-3 rounded-lg hover:bg-senior-friendly-primary-hover text-base sm:text-lg font-medium transition-colors duration-150 ease-in-out"
        >
          请求服务
        </Link>
      </div>
    </div>
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
