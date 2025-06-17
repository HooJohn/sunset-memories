import React, { useEffect, useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RichTextEditor from '../../components/memoirs/RichTextEditor';
import { Editor } from '@tiptap/react';
import { getMemoirById, updateMemoir } from '../../services/api';
import type { UpdateMemoirPayload, Chapter as ApiChapter } from '../../services/api';

type EditMemoirStatus = 'loading' | 'loaded' | 'editing' | 'saving' | 'saved' | 'error';

const EditMemoirPage: React.FC = () => {
  const { id: memoirId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<Editor | null>(null);

  const [status, setStatus] = useState<EditMemoirStatus>('loading');
  const [memoirTitle, setMemoirTitle] = useState<string>('');
  const [editorInitialContent, setEditorInitialContent] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [chapters, setChapters] = useState<ApiChapter[] | null | undefined>(null); // Store chapters

  const [apiError, setApiError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!memoirId) {
      setStatus('error');
      setApiError('No memoir ID provided.');
      return;
    }

    const fetchMemoir = async () => {
      setStatus('loading');
      setApiError(null);
      try {
        const data = await getMemoirById(memoirId); // Now calls actual API
        setMemoirTitle(data.title);
        setEditorInitialContent(data.content_html || '');
        setIsPublic(data.is_public || false);
        setChapters(data.chapters || []); // Store chapters
        setStatus('loaded');
        setTimeout(() => setStatus('editing'), 50); // Allow editor to initialize with content

      } catch (err) {
        console.error('Failed to fetch memoir:', err);
        setApiError(err instanceof Error ? err.message : 'Failed to load memoir.');
        setStatus('error');
      }
    };
    fetchMemoir();
  }, [memoirId]);

  const handleUpdateMemoir = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memoirId || !editorRef.current) {
      setApiError('Cannot update: Memoir ID or Editor not available.');
      setStatus('error');
      return;
    }
    if (!memoirTitle.trim()) {
        alert("Memoir title cannot be empty.");
        return;
    }

    setStatus('saving');
    setApiError(null);
    setUpdateSuccess(null);
    const currentHtmlContent = editorRef.current.getHTML();

    const memoirPayload: UpdateMemoirPayload = {
      title: memoirTitle,
      content_html: currentHtmlContent,
      is_public: isPublic,
      chapters: chapters || undefined, // Send chapters back
      // transcribed_text is usually not updated. If it were, it would be part of fullMemoirData from fetch.
    };

    try {
      const updatedMemoir = await updateMemoir(memoirId, memoirPayload); // Actual API call
      setMemoirTitle(updatedMemoir.title);
      setEditorInitialContent(updatedMemoir.content_html || ''); // Update editor if needed, though it should reflect current state
      editorRef.current?.commands.setContent(updatedMemoir.content_html || '', false); // Force update editor content
      setIsPublic(updatedMemoir.is_public || false);
      setChapters(updatedMemoir.chapters || []);
      setStatus('saved');
      setUpdateSuccess('Memoir updated successfully!');
      setTimeout(() => {
        setStatus('editing');
        setUpdateSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to update memoir:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to update memoir.');
      setStatus('error'); // Stay in error state until user retries or navigates
    }
  };

  if (status === 'loading') {
    return <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="text-xl text-blue-600 dark:text-blue-400 mt-4">Loading memoir...</p></div>;
  }

  if (status === 'error' && apiError) { // Ensure apiError is present before showing error state
    return (
        <div className="text-center p-10 bg-red-50 dark:bg-red-900 rounded-lg shadow-md">
            <p className="text-xl text-red-600 dark:text-red-300">{apiError}</p>
            <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Go Home
            </button>
        </div>
    );
  }


  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleUpdateMemoir} className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">Edit Memoir</h1>

        <div className="space-y-6">
            <div>
                <label htmlFor="memoirTitleEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Memoir Title
                </label>
                <input
                    type="text"
                    id="memoirTitleEdit"
                    name="memoirTitleEdit"
                    value={memoirTitle}
                    onChange={(e) => setMemoirTitle(e.target.value)}
                    placeholder="Enter memoir title"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    disabled={status === 'saving'}
                />
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Edit Content</h2>
                {(status === 'loaded' || status === 'editing' || status === 'saving' || status === 'saved') ? (
                <RichTextEditor
                    initialContent={editorInitialContent}
                    onContentChange={()=>{}} // Not strictly needed if saving from ref
                    editorRef={editorRef}
                />
                ) : (
                <p className="dark:text-gray-300">Editor is loading content...</p>
                )}
            </div>

            <div className="flex items-center">
                <input
                    id="is_public"
                    name="is_public"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
                    disabled={status === 'saving'}
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Make this memoir public?
                </label>
            </div>

            {/* Displaying chapters (read-only for now, could be editable in future) */}
            {chapters && chapters.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Chapters:</h3>
                    <ul className="list-disc list-inside pl-5 mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {chapters.map((chap, idx) => <li key={chap.id || idx}>{chap.title}{chap.summary ? ` - ${chap.summary.substring(0,50)}...` : ''}</li>)}
                    </ul>
                </div>
            )}
        </div>

        {updateSuccess && status === 'saved' && <p className="text-green-600 dark:text-green-400 mt-4 text-center p-2 bg-green-50 dark:bg-green-900 rounded-md">{updateSuccess}</p>}
        {apiError && status === 'error' && <p className="text-red-600 dark:text-red-400 mt-4 text-center p-2 bg-red-50 dark:bg-red-900 rounded-md">{apiError}</p>}


        <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={status === 'saving'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
                {status === 'saving' ? 'Saving...' : 'Update Memoir'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditMemoirPage;
