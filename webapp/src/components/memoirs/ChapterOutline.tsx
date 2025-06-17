import React, { useState, useEffect } from 'react';
import { generateChapters } from '../../services/api'; // Using Chapter from api.ts
import type { Chapter as ApiChapter } from '../../services/api';

// Re-export or use ApiChapter directly if its structure matches what this component needs.
// For this component, we might not need 'id' if it's just for display before saving.
// However, if we allow re-ordering or editing chapters here, an ID (even temporary client-side) is useful.
// For now, let's assume ApiChapter is { title: string, summary?: string }, and we can add a temp id if needed.
export interface Chapter extends ApiChapter { // Extending in case we need client-side specific fields later
    tempId?: string; // Example if we needed a key before real IDs are assigned
}

interface ChapterOutlineProps {
  transcribedText: string | null;
  onOutlineGenerated: (outline: Chapter[]) => void;
}

const ChapterOutline: React.FC<ChapterOutlineProps> = ({
  transcribedText,
  onOutlineGenerated,
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transcribedText && transcribedText.trim() !== "") {
      const processChapterGeneration = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await generateChapters(transcribedText); // Use actual API
          // The API returns { chapters: ApiChapter[] }.
          // We can map them if needed, e.g., to add temporary client-side IDs for keys
          const fetchedChapters: Chapter[] = response.chapters.map((ch) => ({
            ...ch,
            // id: ch.id || `temp-${index}` // If API doesn't return ID, but Chapter interface expects it
          }));
          setChapters(fetchedChapters);
          onOutlineGenerated(fetchedChapters);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "生成大纲时发生未知错误。";
          console.error("Outline generation failed:", errorMessage);
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      processChapterGeneration();
    } else {
      setChapters([]);
      setIsLoading(false);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcribedText]); // Re-run when transcribedText changes

  if (!transcribedText) {
    return (
      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-400 text-center">等待转录文本以生成大纲...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg dark:border-gray-600">
      <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">生成的章节大纲</h3>
      {isLoading && (
        <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-blue-600 dark:text-blue-400 mt-2">正在生成大纲，请稍候...</p>
        </div>
      )}
      {error && <p className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 p-3 rounded-md">错误: {error}</p>}

      {!isLoading && !error && chapters.length > 0 && (
        <>
          <ul className="space-y-3">
            {chapters.map((chapter, index) => ( // Use index for key if no stable ID yet
              <li key={chapter.id || `chapter-${index}`} className="p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-lg text-indigo-700 dark:text-indigo-400">{chapter.title}</h4>
                {chapter.summary && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{chapter.summary}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">大纲已成功生成。您现在可以继续编辑。</p>
        </>
      )}
      {!isLoading && !error && chapters.length === 0 && transcribedText && (
        <p className="text-gray-500 dark:text-gray-400">基于提供的文本未生成任何章节，或者生成仍在待处理中。</p>
      )}
    </div>
  );
};

export default ChapterOutline;
