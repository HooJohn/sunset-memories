import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RichTextEditor from '../../components/memoirs/RichTextEditor';
import { Editor } from '@tiptap/react';
import { getMemoirById, updateMemoir, MemoirData, ChapterData } from '../../services/api'; // Assuming api.ts will export these

type EditMemoirStatus = 'loading' | 'loaded' | 'editing' | 'saving' | 'saved' | 'error';

const EditMemoirPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<Editor | null>(null);

  const [status, setStatus] = useState<EditMemoirStatus>('loading');
  const [memoirTitle, setMemoirTitle] = useState<string>('');
  // content_html is the source of truth for editor, initialContent is just for first load
  const [editorInitialContent, setEditorInitialContent] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Store the full memoir data if needed, e.g., to resend chapters or transcribed_text
  const [fullMemoirData, setFullMemoirData] = useState<MemoirData | null>(null);


  useEffect(() => {
    if (!id) {
      setStatus('error');
      setApiError('No memoir ID provided.');
      return;
    }

    const fetchMemoir = async () => {
      setStatus('loading');
      setApiError(null);
      try {
        const data = await getMemoirById(id); // This function needs to be created in api.ts
        setMemoirTitle(data.title);
        setEditorInitialContent(data.content_html); // Set initial content for TipTap
        setFullMemoirData(data); // Store all fetched data
        setStatus('loaded');
        // Transition to 'editing' once editor has processed initialContent,
        // or immediately if editor handles async initialContent well.
        // For TipTap, useEffect in RichTextEditor handles setting initial content.
        // We can assume it's ready for editing after 'loaded'.
        setTimeout(() => setStatus('editing'), 100); // Small delay for editor to possibly initialize

      } catch (err) {
        console.error('Failed to fetch memoir:', err);
        setApiError(err instanceof Error ? err.message : 'Failed to load memoir.');
        setStatus('error');
      }
    };

    fetchMemoir();
  }, [id]);

  const handleEditorContentChange = (html: string) => {
    // This function is primarily for RichTextEditor's onContentChange callback.
    // We don't strictly need to store it in state here if we fetch from editorRef on save,
    // but it can be useful for auto-save features or debugging.
    // setContentHtml(html);
  };

  const handleUpdateMemoir = async () => {
    if (!id || !editorRef.current) {
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
    const currentHtmlContent = editorRef.current.getHTML();

    // Construct the data to send. Only send fields that are meant to be updated.
    // If backend supports partial updates (PATCH), send only changed fields.
    // For PUT, typically send the complete resource or fields that define it.
    const memoirDataToUpdate: MemoirData = {
      ...fullMemoirData, // Spread existing data to preserve fields like transcribed_text, chapters
      title: memoirTitle,
      content_html: currentHtmlContent,
      // If chapters or transcribed_text can be modified on this page, update them here too.
      // For now, assuming only title and content_html are editable on this simplified page.
      chapters: fullMemoirData?.chapters || [], // Resend existing chapters
      transcribed_text: fullMemoirData?.transcribed_text || null,
    };

    try {
      await updateMemoir(id, memoirDataToUpdate); // This function needs to be in api.ts
      setStatus('saved');
      // Optionally navigate away or show persistent success message
      setTimeout(() => {
        setStatus('editing'); // Revert to editing status after a bit
      }, 2000);
    } catch (err) {
      console.error('Failed to update memoir:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to update memoir.');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return <div className="text-center p-10">Loading memoir...</div>;
  }

  if (status === 'error') {
    return (
        <div className="text-center p-10">
            <p className="text-red-500">Error: {apiError || 'An unknown error occurred.'}</p>
            <button onClick={() => navigate('/')} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Go Home</button>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Edit Memoir</h1>

      <div className="p-6 bg-white shadow-lg rounded-lg">
        <div className="mb-6">
            <label htmlFor="memoirTitleEdit" className="block text-sm font-medium text-gray-700 mb-1">
                Memoir Title
            </label>
            <input
                type="text"
                id="memoirTitleEdit"
                name="memoirTitleEdit"
                value={memoirTitle}
                onChange={(e) => setMemoirTitle(e.target.value)}
                placeholder="Enter memoir title"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={status !== 'editing' && status !== 'loaded'}
            />
        </div>

        <h2 className="text-2xl font-semibold mb-4">Edit Content</h2>
        {(status === 'loaded' || status === 'editing' || status === 'saving' || status === 'saved') && editorInitialContent ? (
          <RichTextEditor
            initialContent={editorInitialContent}
            onContentChange={handleEditorContentChange} // We might not use the updated content from here directly if saving from ref
            editorRef={editorRef}
          />
        ) : (
          <p>Editor is loading content...</p> // Fallback if editorInitialContent is not yet ready
        )}

        {status === 'saved' && <p className="text-green-600 mt-4 text-center">Memoir updated successfully!</p>}
        {apiError && status !== 'error' && <p className="text-red-500 mt-4 text-center">{apiError}</p>}


        <div className="mt-6 text-right">
          <button
            onClick={handleUpdateMemoir}
            disabled={status === 'saving' || status === 'loading'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
          >
            {status === 'saving' ? 'Saving...' : 'Update Memoir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMemoirPage;
