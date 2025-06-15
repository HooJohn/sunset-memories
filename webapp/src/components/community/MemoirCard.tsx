// Placeholder for MemoirCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { PublicMemoirSummary } from '../../services/api'; // To be updated in api.ts

interface MemoirCardProps {
  memoir: PublicMemoirSummary;
  onLikeToggle: (memoirId: string) => void;
  isLiked: boolean;
}

const MemoirCard: React.FC<MemoirCardProps> = ({ memoir, onLikeToggle, isLiked }) => {
  // Function to safely truncate snippet and add ellipsis
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + "...";
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      {/* Optional: Image placeholder */}
      {/* <div className="h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Memoir Image (Optional)</span>
      </div> */}

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          <Link to={`/community/memoirs/${memoir.id}`} className="hover:text-indigo-600 transition-colors duration-200">
            {memoir.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          By <Link to={`/users/${memoir.authorId}`} className="text-indigo-500 hover:underline">{memoir.authorNickname}</Link>
        </p>
        <p className="text-gray-700 text-base mb-4 flex-grow">
          {truncateText(memoir.snippet, 150)}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => onLikeToggle(memoir.id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center space-x-1
                        ${isLiked
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <span>{isLiked ? '❤️ Liked' : '🤍 Like'}</span>
            <span>({memoir.likeCount})</span>
          </button>
          <Link
            to={`/community/memoirs/${memoir.id}`}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Read More &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemoirCard;
