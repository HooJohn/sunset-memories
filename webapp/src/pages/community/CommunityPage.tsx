import React, { useEffect, useState, useCallback } from 'react';
import MemoirCard from '../../components/community/MemoirCard';
import { getPublicMemoirs, likeMemoir, unlikeMemoir } from '../../services/api';
import type { PublicMemoirSummary, LikeResponse } from '../../services/api';

const CommunityPage: React.FC = () => {
  const [memoirs, setMemoirs] = useState<PublicMemoirSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMemoirs, setTotalMemoirs] = useState(0);
  const limitPerPage = 9; // Or make this configurable

  // Local state for liked memoirs (optimistic updates)
  // In a real app, this might be part of a global state or user profile context
  const [likedStatuses, setLikedStatuses] = useState<Record<string, boolean>>({});

  const fetchMemoirs = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPublicMemoirs(page, limitPerPage);
      setMemoirs(response.data);
      setTotalMemoirs(response.total);
      setTotalPages(Math.ceil(response.total / response.limit));
      setCurrentPage(response.page);

      // Initialize liked statuses from fetched memoirs if backend provides isLikedByCurrentUser
      const initialLikedStatuses: Record<string, boolean> = {};
      response.data.forEach(memoir => {
        if (memoir.isLikedByCurrentUser !== undefined) {
          initialLikedStatuses[memoir.id] = memoir.isLikedByCurrentUser;
        }
      });
      setLikedStatuses(prev => ({...prev, ...initialLikedStatuses}));

    } catch (err) {
      console.error('Failed to fetch public memoirs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load public memoirs.');
    } finally {
      setIsLoading(false);
    }
  }, [limitPerPage]);

  useEffect(() => {
    fetchMemoirs(currentPage);
  }, [fetchMemoirs, currentPage]);

  const handleLikeToggle = async (memoirId: string) => {
    const memoir = memoirs.find(m => m.id === memoirId);
    if (!memoir) return;

    const isCurrentlyLiked = likedStatuses[memoirId] ?? memoir.isLikedByCurrentUser ?? false;
    const originalLikeCount = memoir.likeCount || 0;

    // Optimistic UI update
    setLikedStatuses(prev => ({ ...prev, [memoirId]: !isCurrentlyLiked }));
    setMemoirs(prevMemoirs =>
        prevMemoirs.map(m =>
            m.id === memoirId ? { ...m, likeCount: isCurrentlyLiked ? originalLikeCount - 1 : originalLikeCount + 1 } : m
        )
    );

    try {
      let response: LikeResponse;
      if (isCurrentlyLiked) {
        response = await unlikeMemoir(memoirId);
      } else {
        response = await likeMemoir(memoirId);
      }
      // Update with server response
      setMemoirs(prevMemoirs =>
        prevMemoirs.map(m =>
            m.id === memoirId ? { ...m, likeCount: response.likeCount, isLikedByCurrentUser: response.isLikedByCurrentUser } : m
        )
      );
      // Update liked status based on response too
      if (response.isLikedByCurrentUser !== undefined) {
        setLikedStatuses(prev => ({ ...prev, [memoirId]: response.isLikedByCurrentUser as boolean}));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Revert optimistic update on error
      setLikedStatuses(prev => ({ ...prev, [memoirId]: isCurrentlyLiked }));
      setMemoirs(prevMemoirs =>
        prevMemoirs.map(m =>
            m.id === memoirId ? { ...m, likeCount: originalLikeCount } : m
        )
      );
      alert("Failed to update like status. Please try again.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800 dark:text-gray-200">社区回忆录</h1>

      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-center text-gray-600 dark:text-gray-400">浏览社区成员分享的故事（筛选/排序功能即将推出）</p>
      </div>

      {isLoading && <div className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="dark:text-gray-300 mt-4">加载回忆录中...</p></div>}
      {error && <p className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900 p-4 rounded-md text-xl shadow">{error}</p>}

      {!isLoading && !error && memoirs.length === 0 && (
         <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">暂无公开回忆录，快来成为第一个分享的人吧！</p>
        </div>
      )}

      {!isLoading && !error && memoirs.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {memoirs.map(memoir => (
              <MemoirCard
                  key={memoir.id}
                  memoir={memoir}
                  onLikeToggle={() => handleLikeToggle(memoir.id)}
                  isLiked={likedStatuses[memoir.id] ?? memoir.isLikedByCurrentUser ?? false}
              />
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium
                    ${currentPage === pageNumber
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            显示 {memoirs.length} 条，共 {totalMemoirs} 条回忆录。当前为第 {currentPage} 页，共 {totalPages} 页。
          </p>
        </>
      )}
    </div>
  );
};

export default CommunityPage;
