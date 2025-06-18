import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    getPublicMemoirDetails,
    addCommentToMemoir,
    getCommentsForMemoir,
    likeMemoir,
    unlikeMemoir
} from '../../services/api';
import type {
    PublicMemoirDetail, // Using new interface
    MemoirComment as CommentType,
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
        setError("错误：回忆录ID缺失");
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
      setError(err instanceof Error ? `错误：${err.message}` : '错误：加载回忆录数据失败');
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
      setCommentError("错误：回忆录ID缺失");
      return;
    }
    setCommentError(null);
    try {
      const payload: AddCommentPayload = { text }; // Use AddCommentPayload
      const newComment = await addCommentToMemoir(memoirId, payload); // Pass memoirId and payload
      setComments(prevComments => [newComment, ...prevComments]);
    } catch (err) {
      console.error('Failed to add comment:', err);
      const errMsg = err instanceof Error ? `错误：${err.message}` : '错误：提交评论失败';
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
      setLikeError(err instanceof Error ? `错误：${err.message}` : "错误：更新点赞状态失败");
      // Revert optimistic update
      setMemoirDetail(prev => prev ? ({
          ...prev,
          isLikedByCurrentUser: currentIsLiked,
          likeCount: currentLikeCount
      }) : null);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-senior-friendly-primary mx-auto"></div><p className="text-senior-friendly-text dark:text-gray-300 mt-4">加载回忆录中...</p></div>;
  }
  if (error) {
    return <p className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-4 rounded-md shadow text-base sm:text-lg">{error}</p>;
  }
  if (!memoirDetail) {
    return <p className="text-center p-10 text-senior-friendly-text dark:text-gray-300">回忆录未找到。</p>;
  }

  // Determine content to render (either full content_html or chapters)
  let memoirContentHtml = memoirDetail.content_html || '';
  if (!memoirContentHtml && memoirDetail.chapters && memoirDetail.chapters.length > 0) {
    memoirContentHtml = memoirDetail.chapters.map(chap =>
        // Ensure chapter titles are distinct and chapter content is wrapped if it's plain text
        `<h2 class="text-2xl font-semibold mt-6 mb-3">${chap.title}</h2><div class="prose-p:text-justify">${chap.content}</div>`
    ).join('');
  }
  if (!memoirContentHtml) {
    memoirContentHtml = '<p>此回忆录暂无内容。</p>';
  }


  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <article className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-5 sm:p-6 md:p-10">
        <header className="mb-6 md:mb-8 border-b pb-4 md:pb-6 border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-3">{memoirDetail.title}</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
            作者：<Link to={`/users/${memoirDetail.author.id}`} className="text-senior-friendly-primary dark:text-senior-friendly-primary-light hover:underline">{memoirDetail.author.nickname || memoirDetail.author.name || '未知作者'}</Link>
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">发布日期：{new Date(memoirDetail.created_at).toLocaleDateString()}</p>
        </header>

        <div
            className="prose dark:prose-invert max-w-none sm:prose-lg prose-p:text-justify prose-headings:font-semibold prose-headings:text-senior-friendly-primary"
            dangerouslySetInnerHTML={{ __html: memoirContentHtml }}
        />

        <footer className="mt-8 md:mt-10 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <button
                    type="button"
                    onClick={handleLikeToggle}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-150
                        ${memoirDetail.isLikedByCurrentUser
                            ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-senior-friendly-primary'}`}
                >
                    <span>{memoirDetail.isLikedByCurrentUser ? '❤️ 已赞' : '🤍 点赞'}</span>
                    <span className={`ml-1 px-2.5 py-1 rounded-full text-sm font-medium ${memoirDetail.isLikedByCurrentUser ? 'bg-white text-red-500' : 'bg-gray-300 dark:bg-gray-500 text-gray-700 dark:text-gray-100'}`}>
                        {memoirDetail.likeCount ?? 0}
                    </span>
                </button>
                {likeError && <p className="text-red-500 dark:text-red-400 text-sm mt-2 sm:mt-0 sm:ml-4 w-full sm:w-auto text-center sm:text-left">{likeError}</p>}
            </div>
        </footer>
      </article>

      <section className="mt-10 md:mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-gray-100">评论 ({comments.length})</h2>
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-5 sm:p-6 md:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-senior-friendly-primary dark:text-senior-friendly-primary-light">发表评论</h3>
          <MemoirCommentForm onSubmit={handleAddComment} />
          {commentError && <p className="text-red-600 dark:text-red-400 mt-2 text-sm">{commentError}</p>}
        </div>

        <div className="mt-6 sm:mt-8 space-y-6">
          {isLoadingComments ? (
            <p className="dark:text-gray-300 text-center">加载评论中...</p>
          ) : comments.length > 0 ? (
            comments.map(comment => <MemoirComment key={comment.id} comment={comment} />)
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">暂无评论，快来成为第一个评论的人吧！</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ViewMemoirPage;
