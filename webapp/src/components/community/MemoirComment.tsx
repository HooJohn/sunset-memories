import React from 'react';
import { Link } from 'react-router-dom';
import type { MemoirComment as CommentType } from '../../services/api'; // Uses updated interface

interface MemoirCommentProps {
  comment: CommentType;
}

const MemoirComment: React.FC<MemoirCommentProps> = ({ comment }) => {
  const authorName = comment.user?.nickname || comment.user?.name || '匿名用户';
  const authorIdForLink = comment.user?.id || '#'; // Fallback link if author ID is missing
  const avatarUrl = comment.user?.avatar_url;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
      <div className="flex items-start mb-2">
        {avatarUrl ? (
            <img src={avatarUrl} alt={authorName} className="w-10 h-10 rounded-full mr-3 object-cover" />
        ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-500 flex items-center justify-center text-white dark:text-gray-300 font-semibold mr-3 text-lg">
                {authorName.charAt(0).toUpperCase()}
            </div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            <Link to={`/users/${authorIdForLink}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
              {authorName}
            </Link>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-13">{comment.text}</p> {/* Indent comment text slightly if avatar is present */}
      {/* Placeholder for comment actions */}
      {/* <div className="mt-2 text-right">
        <button className="text-xs text-indigo-500 hover:underline">Reply</button>
      </div> */}
    </div>
  );
};

export default MemoirComment;
