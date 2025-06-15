// Placeholder for ViewMemoirPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicMemoirDetails, MemoirResponse, MemoirComment as CommentType, addCommentToMemoir, MemoirCommentData, likeMemoir, unlikeMemoir } from '../../services/api'; // To be updated in api.ts
import MemoirComment from '../../components/community/MemoirComment';
import MemoirCommentForm from '../../components/community/MemoirCommentForm';

const ViewMemoirPage: React.FC = () => {
  const { id: memoirId } = useParams<{ id: string }>();
  const [memoir, setMemoir] = useState<MemoirResponse | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [likeCount, setLikeCount] = useState<number>(0); // Local like count state
  const [isLiked, setIsLiked] = useState<boolean>(false); // User's like status for this memoir
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchMemoirData = useCallback(async () => {
    if (!memoirId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { memoir: memoirData, comments: commentsData } = await getPublicMemoirDetails(memoirId);
      setMemoir(memoirData);
      setComments(commentsData);
      // Assuming MemoirResponse contains likeCount and user's like status
      // For now, we'll set a mock likeCount if not present, and manage isLiked locally
      setLikeCount(memoirData.likeCount || 0); // Ensure likeCount is part of MemoirResponse or fetch separately
      // setIsLiked(memoirData.isLikedByCurrentUser || false); // This field would need to come from backend
    } catch (err) {
      console.error('Failed to fetch memoir details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load memoir.');
    } finally {
      setIsLoading(false);
    }
  }, [memoirId]);

  useEffect(() => {
    fetchMemoirData();
  }, [fetchMemoirData]);

  const handleAddComment = async (text: string) => {
    if (!memoirId) {
      setCommentError("Memoir ID is missing.");
      return;
    }
    setCommentError(null);
    try {
      const commentData: MemoirCommentData = { memoirId, text };
      const newComment = await addCommentToMemoir(commentData);
      setComments(prevComments => [newComment, ...prevComments]); // Add new comment to the top
    } catch (err) {
      console.error('Failed to add comment:', err);
      setCommentError(err instanceof Error ? err.message : 'Failed to post comment.');
      throw err; // Allow form to handle its own state
    }
  };

  const handleLikeToggle = async () => {
    if (!memoirId) return;

    // Optimistic update
    const originalLikeCount = likeCount;
    const originalIsLiked = isLiked;
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsLiked(!isLiked);

    try {
      const response = isLiked ? await unlikeMemoir(memoirId) : await likeMemoir(memoirId);
      setLikeCount(response.likeCount); // Update with actual count from server
      // setIsLiked will remain as toggled, assuming success
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Revert optimistic update on error
      setLikeCount(originalLikeCount);
      setIsLiked(originalIsLiked);
      // Optionally show error to user
      alert("Failed to update like status. Please try again.");
    }
  };

  if (isLoading) {
    return <p className="text-center p-10 text-xl">Loading memoir...</p>;
  }
  if (error) {
    return <p className="text-center text-red-500 bg-red-100 p-4 rounded-md text-xl">{error}</p>;
  }
  if (!memoir) {
    return <p className="text-center p-10 text-xl">Memoir not found.</p>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <article className="bg-white shadow-xl rounded-lg p-6 md:p-10">
        <header className="mb-8 border-b pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">{memoir.title}</h1>
          <p className="text-lg text-gray-600">
            By <Link to={`/users/${memoir.user_id}`} className="text-indigo-600 hover:underline">{memoir.authorNickname || 'Unknown Author'}</Link>
          </p>
          <p className="text-sm text-gray-500 mt-1">Published on: {new Date(memoir.created_at).toLocaleDateString()}</p>
        </header>

        {/*
          Using dangerouslySetInnerHTML for HTML content from rich text editor.
          IMPORTANT: This HTML comes from our TipTap editor, which should be structured and safe.
          However, if there were any way for users to inject arbitrary HTML/script through the editor
          (e.g., if the editor allows raw HTML input mode or if there's a vulnerability),
          it would be a security risk.
          ALWAYS ensure that HTML content is properly sanitized on the backend before it's stored
          and before it's delivered to any client for rendering. Libraries like DOMPurify (server-side or client-side)
          can be used for this. For content generated by a controlled TipTap instance, the risk is lower
          than user-supplied raw HTML, but sanitization is best practice for defense in depth.
        */}
        <div
            className="prose prose-lg max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: memoir.content_html || '<p>No content available.</p>' }}
        />

        <footer className="mt-10 pt-6 border-t">
            <div className="flex justify-between items-center">
                <button
                    onClick={handleLikeToggle}
                    className={`px-4 py-2 rounded-md font-semibold flex items-center space-x-2 transition-colors duration-150
                        ${isLiked
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    <span>{isLiked ? 'Unlike' : 'Like'}</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full text-sm bg-white text-red-500">{likeCount}</span>
                </button>
                {/* Other actions like Share can go here */}
            </div>
        </footer>
      </article>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Comments ({comments.length})</h2>
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Leave a Comment</h3>
          <MemoirCommentForm onSubmit={handleAddComment} />
          {commentError && <p className="text-red-500 mt-2">{commentError}</p>}
        </div>

        <div className="mt-8 space-y-6">
          {comments.length > 0 ? (
            comments.map(comment => <MemoirComment key={comment.id} comment={comment} />)
          ) : (
            <p className="text-gray-600 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ViewMemoirPage;
