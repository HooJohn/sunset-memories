import React from 'react';
import { Link } from 'react-router-dom';
import type { PublicMemoirSummary } from '../../services/api';

interface MemoirCardProps {
  memoir: PublicMemoirSummary;
  onLikeToggle: (memoirId: string) => void; // Parent handles API call and state update
  isLiked: boolean; // Parent tells card if it's liked
}

const MemoirCard: React.FC<MemoirCardProps> = ({ memoir, onLikeToggle, isLiked }) => {
  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return "无内容摘要";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + "...";
  };

  const authorName = memoir.author?.nickname || memoir.author?.name || '未知作者';
  const authorIdForLink = memoir.author?.id || '#'; // Fallback link if author ID is missing

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden flex flex-col h-full hover:shadow-2xl transition-shadow duration-300 ease-in-out">
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          <Link to={`/community/memoirs/${memoir.id}`} className="hover:text-senior-friendly-primary-dark dark:hover:text-senior-friendly-primary-light transition-colors duration-200">
            {memoir.title}
          </Link>
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
          作者: <Link to={`/users/${authorIdForLink}`} className="text-senior-friendly-primary dark:text-senior-friendly-primary-light hover:underline">{authorName}</Link>
        </p>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 flex-grow">
          {truncateText(memoir.snippet, 120)} {/* Adjusted snippet length for potentially smaller cards */}
        </p>

        <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <button
            type="button"
            onClick={() => onLikeToggle(memoir.id)}
            aria-pressed={isLiked}
            aria-label={isLiked ? "取消点赞此回忆录" : "点赞此回忆录"}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                        ${isLiked
                            ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-senior-friendly-primary'}`}
          >
            {/* Using text for heart to ensure visibility, could be replaced with actual SVG icons */}
            <span className={`mr-1 ${isLiked ? 'text-red-300' : 'text-gray-400'}`}>{isLiked ? '♥' : '♡'}</span>
            <span>{memoir.likeCount ?? 0}</span>
          </button>
          <Link
            to={`/community/memoirs/${memoir.id}`}
            className="text-senior-friendly-primary dark:text-senior-friendly-primary-light hover:underline font-medium text-sm"
          >
            查看更多 &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemoirCard;
