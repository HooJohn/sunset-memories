// Placeholder for MemoirComment.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MemoirComment as CommentType } from '../../services/api'; // To be updated in api.ts

interface MemoirCommentProps {
  comment: CommentType;
}

const MemoirComment: React.FC<MemoirCommentProps> = ({ comment }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-2">
        {/* Placeholder for avatar */}
        {/* <img src={comment.authorAvatarUrl || '/default-avatar.png'} alt={comment.userNickname} className="w-10 h-10 rounded-full mr-3" /> */}
        <div>
          <p className="font-semibold text-gray-800">
            <Link to={`/users/${comment.userId}`} className="hover:text-indigo-600">
              {comment.userNickname}
            </Link>
          </p>
          <p className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
      {/* Placeholder for comment actions like reply, edit, delete if user has permission */}
      {/* <div className="mt-2 text-right">
        <button className="text-xs text-indigo-500 hover:underline">Reply</button>
      </div> */}
    </div>
  );
};

export default MemoirComment;
