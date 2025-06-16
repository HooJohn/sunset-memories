import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    getPublicMemoirDetails,
    PublicMemoirDetail, // Using new interface
    MemoirComment as CommentType,
    addCommentToMemoir,
    getCommentsForMemoir, // New function
    likeMemoir,
    unlikeMemoir,
    LikeResponse,
    AddCommentPayload
} from '../../services/api';
import MemoirComment from '../../components/community/MemoirComment';
import MemoirCommentForm from '../../components/community/MemoirCommentForm';

const ViewMemoirPage: React.FC = () => {
  const { id: memoirId } = useParams<{ id: string }>();
  const [memoirDetail, setMemoirDetail] = useState<PublicMemoirDetail | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);

  // Like state is now derived from memoirDetail
  // const [likeCount, setLikeCount] = useState<number>(0);
  // const [isLiked, setIsLiked] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  const fetchMemoirAndComments = useCallback(async () => {
    if (!memoirId) {
        setError("Memoir ID is missing.");
        setIsLoading(false);
        setIsLoadingComments(false);
        return;
    }
    setIsLoading(true);
    setIsLoadingComments(true);
    setError(null);
    try {
      const memoirData = await getPublicMemoirDetails(memoirId); // Fetches memoir including chapters
      setMemoirDetail(memoirData);

      const commentsData = await getCommentsForMemoir(memoirId); // Separate call for comments
      setComments(commentsData);

    } catch (err) {
      console.error('Failed to fetch memoir details or comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load memoir data.');
    } finally {
      setIsLoading(false);
      setIsLoadingComments(false);
    }
  }, [memoirId]);

  useEffect(() => {
    fetchMemoirAndComments();
  }, [fetchMemoirAndComments]);

  const handleAddComment = async (text: string) => {
    if (!memoirId) {
      setCommentError("Memoir ID is missing.");
      return;
    }
    setCommentError(null);
    try {
      const payload: AddCommentPayload = { text }; // Use AddCommentPayload
      const newComment = await addCommentToMemoir(memoirId, payload); // Pass memoirId and payload
      setComments(prevComments => [newComment, ...prevComments]);
    } catch (err) {
      console.error('Failed to add comment:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to post comment.';
      setCommentError(errMsg);
      throw new Error(errMsg);
    }
  };

  const handleLikeToggle = async () => {
    if (!memoirId || !memoirDetail) return;
    setLikeError(null);

    const currentIsLiked = memoirDetail.isLikedByCurrentUser ?? false;
    const currentLikeCount = memoirDetail.likeCount ?? 0;

    // Optimistic update
    setMemoirDetail(prev => prev ? ({
        ...prev,
        isLikedByCurrentUser: !currentIsLiked,
        likeCount: currentIsLiked ? currentLikeCount - 1 : currentLikeCount + 1
    }) : null);

    try {
      const response: LikeResponse = currentIsLiked
        ? await unlikeMemoir(memoirId)
        : await likeMemoir(memoirId);

      // Update with server response
      setMemoirDetail(prev => prev ? ({
          ...prev,
          likeCount: response.likeCount,
          isLikedByCurrentUser: response.isLikedByCurrentUser
      }) : null);
    } catch (err) {
      console.error('Failed to toggle like:', err);
      setLikeError(err instanceof Error ? err.message : "Failed to update like status.");
      // Revert optimistic update
      setMemoirDetail(prev => prev ? ({
          ...prev,
          isLikedByCurrentUser: currentIsLiked,
          likeCount: currentLikeCount
      }) : null);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="dark:text-gray-300 mt-4">Loading memoir...</p></div>;
  }
  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900 p-4 rounded-md shadow">{error}</p>;
  }
  if (!memoirDetail) {
    return <p className="text-center p-10 dark:text-gray-300">Memoir not found.</p>;
  }

  // Determine content to render (either full content_html or chapters)
  let memoirContentHtml = memoirDetail.content_html || '';
  if (!memoirContentHtml && memoirDetail.chapters && memoirDetail.chapters.length > 0) {
    memoirContentHtml = memoirDetail.chapters.map(chap =>
        `<h2>${chap.title}</h2><div>${chap.content}</div>` // Assuming chapter.content is HTML
    ).join('');
  }
  if (!memoirContentHtml) {
    memoirContentHtml = '<p>No content available for this memoir.</p>';
  }


  return (
    <div className="container mx-auto p-4 md:p-8">
      <article className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-10">
        <header className="mb-8 border-b pb-6 border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-3">{memoirDetail.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            By <Link to={`/users/${memoirDetail.author.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{memoirDetail.author.nickname || memoirDetail.author.name || 'Unknown Author'}</Link>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Published on: {new Date(memoirDetail.created_at).toLocaleDateString()}</p>
        </header>

        <div
            className="prose prose-lg dark:prose-invert max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: memoirContentHtml }}
        />

        <footer className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
                <button
                    type="button"
                    onClick={handleLikeToggle}
                    className={`px-4 py-2 rounded-md font-semibold flex items-center space-x-2 transition-colors duration-150
                        ${memoirDetail.isLikedByCurrentUser
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    <span>{memoirDetail.isLikedByCurrentUser ? '❤️ Liked' : '🤍 Like'}</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-sm ${memoirDetail.isLikedByCurrentUser ? 'bg-white text-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        {memoirDetail.likeCount ?? 0}
                    </span>
                </button>
            </div>
            {likeError && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{likeError}</p>}
        </footer>
      </article>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Comments ({comments.length})</h2>
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400">Leave a Comment</h3>
          <MemoirCommentForm onSubmit={handleAddComment} />
          {commentError && <p className="text-red-500 dark:text-red-400 mt-2 text-sm">{commentError}</p>}
        </div>

        <div className="mt-8 space-y-6">
          {isLoadingComments ? (
            <p className="dark:text-gray-300 text-center">Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map(comment => <MemoirComment key={comment.id} comment={comment} />)
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ViewMemoirPage;
