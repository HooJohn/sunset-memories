// Placeholder for CommunityPage.tsx
import React, { useEffect, useState } from 'react';
import MemoirCard from '../../components/community/MemoirCard';
import { getPublicMemoirs, PublicMemoirSummary, likeMemoir, unlikeMemoir } from '../../services/api'; // To be updated in api.ts

const CommunityPage: React.FC = () => {
  const [memoirs, setMemoirs] = useState<PublicMemoirSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Basic liked state management for demonstration on this page
  const [likedMemoirs, setLikedMemoirs] = useState<Set<string>>(new Set());

  const fetchMemoirs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPublicMemoirs(); // Assuming no filters for now
      setMemoirs(data);
    } catch (err) {
      console.error('Failed to fetch public memoirs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load public memoirs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoirs();
  }, []);

  const handleLikeToggle = async (memoirId: string, currentLikeCount: number) => {
    const isCurrentlyLiked = likedMemoirs.has(memoirId);
    // Optimistic update
    setMemoirs(prevMemoirs =>
        prevMemoirs.map(m =>
            m.id === memoirId ? { ...m, likeCount: isCurrentlyLiked ? currentLikeCount -1 : currentLikeCount + 1 } : m
        )
    );
    setLikedMemoirs(prevLikes => {
        const newLikes = new Set(prevLikes);
        if (isCurrentlyLiked) newLikes.delete(memoirId);
        else newLikes.add(memoirId);
        return newLikes;
    });

    try {
      let response;
      if (isCurrentlyLiked) {
        response = await unlikeMemoir(memoirId);
      } else {
        response = await likeMemoir(memoirId);
      }
      // Update with server response
      setMemoirs(prevMemoirs =>
        prevMemoirs.map(m =>
            m.id === memoirId ? { ...m, likeCount: response.likeCount } : m
        )
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Revert optimistic update on error
      setMemoirs(prevMemoirs =>
        prevMemoirs.map(m =>
            m.id === memoirId ? { ...m, likeCount: currentLikeCount } : m
        )
      );
      setLikedMemoirs(prevLikes => {
        const newLikes = new Set(prevLikes);
        if (isCurrentlyLiked) newLikes.add(memoirId); // if it was liked, and unlike failed, re-add
        else newLikes.delete(memoirId); // if it was not liked, and like failed, re-delete
        return newLikes;
    });
      // Optionally show error to user
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">Community Memoirs</h1>

      {/* Placeholder for filtering/sorting options */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <p className="text-center text-gray-600">Filtering and sorting options will be here.</p>
      </div>

      {isLoading && <p className="text-center text-gray-600 text-xl">Loading memoirs...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md text-xl">{error}</p>}

      {!isLoading && !error && memoirs.length === 0 && (
        <p className="text-center text-gray-600 text-xl">No public memoirs found at the moment. Be the first to share!</p>
      )}

      {!isLoading && !error && memoirs.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memoirs.map(memoir => (
            <MemoirCard
                key={memoir.id}
                memoir={memoir}
                onLikeToggle={() => handleLikeToggle(memoir.id, memoir.likeCount)}
                isLiked={likedMemoirs.has(memoir.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
