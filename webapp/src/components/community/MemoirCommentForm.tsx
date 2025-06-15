// Placeholder for MemoirCommentForm.tsx
import React, { useState } from 'react';

interface MemoirCommentFormProps {
  onSubmit: (text: string) => Promise<void>;
  // memoirId is handled by the parent page (ViewMemoirPage)
}

const MemoirCommentForm: React.FC<MemoirCommentFormProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText(''); // Clear form on successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm p-2 bg-red-100 rounded">{error}</p>}
      <div>
        <label htmlFor="commentText" className="sr-only">
          Your Comment
        </label>
        <textarea
          id="commentText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Write your comment here..."
          disabled={isSubmitting}
        />
      </div>
      <div className="text-right">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default MemoirCommentForm;
