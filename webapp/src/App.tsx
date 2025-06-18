import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/user/ProfilePage';
// Memoir Pages
import CreateMemoirPage from './pages/memoirs/CreateMemoirPage';
import MyMemoirsPage from './pages/memoirs/MyMemoirsPage'; // New page for listing user's memoirs
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
import FeaturedMemoirBanner from './components/home/FeaturedMemoirBanner'; // Import the new banner

import { getPublicMemoirs, PublicMemoirSummary } from './services/api'; // For content feed
import MemoirCard from './components/community/MemoirCard'; // For content feed
import { useState, useEffect, useCallback } from 'react'; // For content feed state and effects

// A simple placeholder for a home page component
const HomePage: React.FC = () => {
  const [feedMemoirs, setFeedMemoirs] = useState<PublicMemoirSummary[]>([]);
  const [feedCurrentPage, setFeedCurrentPage] = useState(1);
  const [feedIsLoading, setFeedIsLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [hasMoreMemoirs, setHasMoreMemoirs] = useState(true);
  const feedLimitPerPage = 2;


  const fetchFeedMemoirs = useCallback(async (page: number, append: boolean = false) => {
    setFeedIsLoading(true);
    setFeedError(null);
    try {
      const response = await getPublicMemoirs(page, feedLimitPerPage);
      if (response.data && response.data.length > 0) {
        setFeedMemoirs(prevMemoirs => append ? [...prevMemoirs, ...response.data] : response.data);
        setFeedCurrentPage(page);
        if (response.data.length < feedLimitPerPage || (page * feedLimitPerPage) >= response.total) {
          setHasMoreMemoirs(false);
        }
      } else {
        setHasMoreMemoirs(false); // No more data found
      }
    } catch (err) {
      console.error('Failed to fetch feed memoirs:', err);
      setFeedError(err instanceof Error ? err.message : '加载动态失败');
    } finally {
      setFeedIsLoading(false);
    }
  }, [feedLimitPerPage]);

  useEffect(() => {
    // Initial fetch for the feed
    fetchFeedMemoirs(1, false);
  }, [fetchFeedMemoirs]);

  const handleLoadMore = () => {
    if (hasMoreMemoirs && !feedIsLoading) {
      fetchFeedMemoirs(feedCurrentPage + 1, true);
    }
  };

  // Dummy like toggle handler for MemoirCard, actual liking handled on community/details page
  const handleDummyLikeToggle = (memoirId: string) => {
    console.log("Like toggle attempted on homepage for memoir:", memoirId);
    // In a real scenario, you might want to update a local liked state
    // or navigate to the memoir page for the user to perform the action.
    // For this feed, we'll keep it simple and not implement optimistic updates here.
  };


  return (
    <div className="space-y-10 md:space-y-16 pb-10 md:pb-16"> {/* Added pb for spacing */}
      <FeaturedMemoirBanner />

      {/* Original HomePage content starts here, wrapped in a new div for consistent padding */}
      <div className="text-center px-4 sm:px-6"> {/* Reduced top padding as banner is above, px for side padding */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-senior-friendly-primary">🌟 记录您的故事，分享您的回忆</h2>
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

  {/* Content Feed Section */}
  <section className="px-4 sm:px-6">
    <h2 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8 text-center sm:text-left text-senior-friendly-primary">
      最新分享
    </h2>
    {feedMemoirs.length === 0 && !feedIsLoading && !feedError && (
      <p className="text-center text-senior-friendly-text text-lg">暂无分享，敬请期待！</p>
    )}
    {feedMemoirs.length === 0 && feedIsLoading && (
      // Basic loading state for initial feed load
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-senior-friendly-primary mx-auto my-4"></div>
        <p className="text-senior-friendly-text">加载最新分享中...</p>
      </div>
    )}
    {feedError && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md shadow">{feedError}</p>}

    <div className="space-y-8 max-w-2xl mx-auto"> {/* Vertical stacking, centered with max-width */}
      {feedMemoirs.map(memoir => (
        <MemoirCard
          key={memoir.id}
          memoir={memoir}
          // isLiked and onLikeToggle are more complex for a feed on homepage
          // For now, pass a dummy handler or consider if like status is crucial here
          isLiked={false} // Or fetch this if truly needed, adds complexity
          onLikeToggle={() => handleDummyLikeToggle(memoir.id)}
        />
      ))}
    </div>

    {hasMoreMemoirs && !feedError && (
      <div className="mt-8 md:mt-10 text-center">
        <button
          onClick={handleLoadMore}
          disabled={feedIsLoading}
          className="bg-senior-friendly-primary text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-senior-friendly-primary-hover disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out text-base sm:text-lg"
        >
          {feedIsLoading ? '加载中...' : '加载更多'}
        </button>
      </div>
    )}
    {!hasMoreMemoirs && feedMemoirs.length > 0 && !feedError && (
       <p className="text-center text-senior-friendly-text mt-8 md:mt-10">已加载全部内容。</p>
    )}
  </section>
</div>
  );
};

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
          {/* The "Create" link in nav now goes to MyMemoirsPage via /my-creations */}
          <Route path="/my-creations" element={<MyMemoirsPage />} />
          <Route path="/memoirs/create" element={<CreateMemoirPage />} /> {/* MyMemoirsPage links here to create new */}
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
