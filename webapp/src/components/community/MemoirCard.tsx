import React from 'react';
import { Link } from 'react-router-dom';
import { PublicMemoirSummary } from '../../services/api';

interface MemoirCardProps {
  memoir: PublicMemoirSummary;
  onLikeToggle: (memoirId: string) => void; // Parent handles API call and state update
  isLiked: boolean; // Parent tells card if it's liked
}

const MemoirCard: React.FC<MemoirCardProps> = ({ memoir, onLikeToggle, isLiked }) => {
  const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return "No snippet available.";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + "...";
  };

  const authorName = memoir.author?.nickname || memoir.author?.name || 'Unknown Author';
  const authorIdForLink = memoir.author?.id || '#'; // Fallback link if author ID is missing

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden flex flex-col h-full hover:shadow-2xl transition-shadow duration-300 ease-in-out">
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          <Link to={`/community/memoirs/${memoir.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
            {memoir.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          By <Link to={`/users/${authorIdForLink}`} className="text-indigo-500 dark:text-indigo-400 hover:underline">{authorName}</Link>
        </p>
        <p className="text-gray-700 dark:text-gray-300 text-base mb-4 flex-grow">
          {truncateText(memoir.snippet, 150)}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <button
            type="button"
            onClick={() => onLikeToggle(memoir.id)}
            aria-pressed={isLiked}
            aria-label={isLiked ? "Unlike this memoir" : "Like this memoir"}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center space-x-1.5 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                        ${isLiked
                            ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-indigo-500'}`}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{memoir.likeCount ?? 0}</span>
          </button>
          <Link
            to={`/community/memoirs/${memoir.id}`}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm"
          >
            Read More &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemoirCard;
