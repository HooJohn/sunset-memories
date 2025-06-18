import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getMemoirs, getMemoirById, Memoir as UserMemoir, Chapter } from '../../services/api';
import { PlusCircleIcon, ArrowLeftIcon, ListBulletIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const MyMemoirsPage: React.FC = () => {
  const [memoirs, setMemoirs] = useState<UserMemoir[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedMemoirId, setSelectedMemoirId] = useState<string | null>(null);
  const [selectedMemoirData, setSelectedMemoirData] = useState<UserMemoir | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null); // For scrolling to chapter

  const fetchUserMemoirs = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const response = await getMemoirs();
      setMemoirs(response.data || []);
    } catch (err) {
      console.error('Failed to fetch user memoirs:', err);
      setListError(err instanceof Error ? err.message : '加载您的回忆录列表失败');
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchUserMemoirs();
  }, [fetchUserMemoirs]);

  const fetchFullMemoirDetails = useCallback(async (memoirId: string) => {
    setIsLoadingDetail(true);
    setDetailError(null);
    setSelectedMemoirData(null); // Clear previous data
    try {
      const memoirDetails = await getMemoirById(memoirId);
      setSelectedMemoirData(memoirDetails);
    } catch (err) {
      console.error('Failed to fetch memoir details:', err);
      setDetailError(err instanceof Error ? err.message : '加载回忆录详情失败');
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMemoirId) {
      fetchFullMemoirDetails(selectedMemoirId);
    } else {
      // Clear selected memoir data if ID is cleared
      setSelectedMemoirData(null);
    }
  }, [selectedMemoirId, fetchFullMemoirDetails]);

  const handleMemoirClick = (memoirId: string) => {
    setSelectedMemoirId(memoirId);
  };

  const handleBackToList = () => {
    setSelectedMemoirId(null);
    setDetailError(null); // Clear detail error when going back
  };

  const handleChapterClick = (chapterTitle: string) => {
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let found = false;
      headings.forEach(heading => {
        if (heading.textContent?.trim().toLowerCase() === chapterTitle.trim().toLowerCase()) {
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
          found = true;
        }
      });
      if (!found) {
        // Fallback: if no exact match, try to find partial match or just scroll to top of content
        console.warn(`Chapter heading "${chapterTitle}" not found precisely. Scrolling to top of content.`);
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '未知日期';
    return new Date(dateString).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // View for displaying full memoir details (Table of Contents view)
  if (selectedMemoirId) {
    if (isLoadingDetail) {
      return (
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-senior-friendly-primary mx-auto"></div>
          <p className="text-senior-friendly-text mt-4">加载回忆录详情中...</p>
        </div>
      );
    }

    if (detailError || !selectedMemoirData) {
      return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 text-center">
          <p className="text-red-500 bg-red-100 p-4 rounded-md shadow mb-6">错误：{detailError || '未能加载回忆录数据。'}</p>
          <button
            onClick={handleBackToList}
            className="inline-flex items-center bg-senior-friendly-primary text-white px-6 py-2 rounded-lg hover:bg-senior-friendly-primary-hover"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            返回列表
          </button>
        </div>
      );
    }

    const { title, chapters, content_html } = selectedMemoirData;
    const tocChapters = chapters && chapters.length > 0 ? chapters : (title ? [{ title: title, summary: '', id: 'main' }] : []);


    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <button
          onClick={handleBackToList}
          className="inline-flex items-center text-senior-friendly-primary hover:text-senior-friendly-primary-dark font-semibold mb-6 group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform duration-150 ease-in-out group-hover:-translate-x-1" />
          返回我的创作列表
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-senior-friendly-primary mb-4 sm:mb-6">
          {title || '回忆录详情'}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents - Sticky for larger screens */}
          <aside className="lg:w-1/4 xl:w-1/5 lg:sticky lg:top-24 self-start bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-senior-friendly-primary-dark dark:text-white mb-4 flex items-center">
              <ListBulletIcon className="h-6 w-6 mr-2"/>
              目录
            </h2>
            {tocChapters.length > 0 ? (
              <ul className="space-y-2">
                {tocChapters.map((chapter, index) => (
                  <li key={chapter.id || `chap-${index}`}>
                    <button
                      onClick={() => handleChapterClick(chapter.title)}
                      className="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-senior-friendly-primary"
                      title={`跳转到章节: ${chapter.title}`}
                    >
                      {chapter.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">暂无章节信息。</p>
            )}
          </aside>

          {/* Memoir Content */}
          <article className="lg:w-3/4 xl:w-4/5 bg-white dark:bg-gray-800 p-5 sm:p-6 md:p-8 rounded-xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold text-senior-friendly-primary-dark dark:text-white mb-6 flex items-center sr-only">
              <BookOpenIcon className="h-6 w-6 mr-2"/>
              回忆录正文 {/* Screen-reader only title for the article section */}
            </h2>
            {content_html ? (
              <div
                ref={contentRef}
                className="prose dark:prose-invert max-w-none sm:prose-lg prose-headings:text-senior-friendly-primary prose-p:text-justify"
                dangerouslySetInnerHTML={{ __html: content_html }}
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-10">此回忆录暂无正文内容。</p>
            )}
          </article>
        </div>
      </div>
    );
  }

  // View for listing all user memoirs (initial view)
  if (isLoadingList) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-senior-friendly-primary mx-auto"></div>
        <p className="text-senior-friendly-text mt-4">加载您的回忆录中...</p>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 bg-red-100 p-4 rounded-md shadow">错误：{listError}</p>
        <button
          onClick={fetchUserMemoirs}
          className="mt-6 bg-senior-friendly-primary text-white px-6 py-2 rounded-lg hover:bg-senior-friendly-primary-hover"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-senior-friendly-primary">
          我的创作
        </h1>
        <Link
          to="/memoirs/create"
          className="inline-flex items-center justify-center bg-senior-friendly-primary text-white font-semibold px-5 py-3 sm:px-6 sm:py-3 rounded-lg shadow-md hover:bg-senior-friendly-primary-hover transition-colors duration-150 ease-in-out text-base sm:text-lg"
        >
          <PlusCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          创作新回忆录
        </Link>
      </header>

      {memoirs.length === 0 ? (
        <div className="text-center py-12 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            {/* Placeholder icon, consider a more relevant one like an empty book or quill */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">您还没有创作任何回忆录。</p>
          <p className="text-base text-gray-500 dark:text-gray-500">开始记录您的故事，与世界分享您的宝贵记忆吧！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {memoirs.map(memoir => (
            <button // Changed from Link to button to handle click state change
              onClick={() => handleMemoirClick(memoir.id)}
              key={memoir.id}
              className="block w-full text-left bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-senior-friendly-primary"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-senior-friendly-primary-dark dark:text-senior-friendly-primary-light group-hover:underline">
                  {memoir.title || '未命名回忆录'}
                </h2>
                <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1 sm:mt-0">
                  {/* Can add status like 'Published' or 'Draft' if available */}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 mb-3">
                {memoir.snippet || '暂无简介...'}
              </p>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 flex flex-col sm:flex-row sm:space-x-4">
                <span>创建于: {formatDate(memoir.created_at)}</span>
                <span>最后更新: {formatDate(memoir.updated_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMemoirsPage;
