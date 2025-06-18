import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicMemoirs, PublicMemoirSummary } from '../../services/api';

const FeaturedMemoirBanner: React.FC = () => {
  const [featuredMemoir, setFeaturedMemoir] = useState<PublicMemoirSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedMemoir = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch the latest 1 memoir to be featured
        const response = await getPublicMemoirs(1, 1);
        if (response.data && response.data.length > 0) {
          setFeaturedMemoir(response.data[0]);
        } else {
          // No memoirs available to feature, not necessarily an error for the banner
          setFeaturedMemoir(null);
        }
      } catch (err) {
        console.error('Failed to fetch featured memoir:', err);
        setError(err instanceof Error ? err.message : '加载精选回忆录失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedMemoir();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 animate-pulse p-8 rounded-lg shadow-lg text-center h-64 flex items-center justify-center">
        <p className="text-gray-500 text-lg">加载中...</p>
      </div>
    );
  }

  if (error) {
    // Optionally render nothing or a subtle error message if fetching fails
    // For a banner, sometimes it's better to just not show it if there's an error
    return null;
    // Or return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!featuredMemoir) {
    // No memoir to feature, render nothing or a placeholder encouraging creation
    return (
        <div className="w-full bg-gradient-to-br from-senior-friendly-primary-light via-senior-friendly-secondary to-senior-friendly-accent p-8 md:p-12 rounded-lg shadow-xl text-white text-center h-auto md:h-72 flex flex-col items-center justify-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">分享您的故事</h2>
            <p className="text-base sm:text-lg md:text-xl mb-6">成为我们社区的第一位分享者，用您的回忆感动他人。</p>
            <Link
                to="/memoirs/create"
                className="bg-white text-senior-friendly-primary font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-150 ease-in-out text-base sm:text-lg"
            >
                开始创作回忆录
            </Link>
        </div>
    );
  }

  const authorName = featuredMemoir.author?.nickname || featuredMemoir.author?.name || '未知作者';
  const snippet = featuredMemoir.snippet || '暂无摘要。';

  return (
    <div
      className="w-full rounded-lg shadow-2xl overflow-hidden relative bg-gradient-to-tr from-senior-friendly-primary via-senior-friendly-secondary to-senior-friendly-accent text-white p-6 sm:p-8 md:p-12 flex flex-col justify-between min-h-[280px] sm:min-h-[320px]"
      // Placeholder for background image style: style={{ backgroundImage: `url(${featuredMemoir.imageUrl || 'default-banner.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Background overlay for text readability if using actual image */}
      {/* <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div> */}

      <div className="relative z-10"> {/* Content on top of overlay */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
          {featuredMemoir.title}
        </h2>
        <p className="text-sm sm:text-base md:text-lg font-medium text-gray-200 mb-3 sm:mb-4">
          作者：{authorName}
        </p>
      </div>

      <div className="relative z-10 mt-4">
        <p className="text-base sm:text-lg mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
          {snippet}
        </p>
        <Link
          to={`/community/memoirs/${featuredMemoir.id}`}
          className="inline-block bg-white text-senior-friendly-primary font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-150 ease-in-out text-sm sm:text-base"
        >
          阅读更多 &rarr;
        </Link>
      </div>
    </div>
  );
};

export default FeaturedMemoirBanner;
