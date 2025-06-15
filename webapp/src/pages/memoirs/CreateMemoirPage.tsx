import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceRecorder from '../../components/memoirs/VoiceRecorder';
import ChapterOutline, { Chapter } from '../../components/memoirs/ChapterOutline';
import RichTextEditor from '../../components/memoirs/RichTextEditor';
import { Editor } from '@tiptap/react';
import { createMemoir, MemoirData } from '../../services/api';

enum CreationStep {
  Recording,
  OutlineGeneration,
  Editing,
  Saving,
  Saved,
  Error,
}

const CreateMemoirPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CreationStep>(CreationStep.Recording);
  const [memoirTitle, setMemoirTitle] = useState<string>('');
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [generatedOutline, setGeneratedOutline] = useState<Chapter[] | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newMemoirId, setNewMemoirId] = useState<string | null>(null);

  const editorRef = useRef<Editor | null>(null);
  const navigate = useNavigate();

  const handleTranscriptionComplete = (text: string) => {
    setTranscribedText(text);
    setCurrentStep(CreationStep.OutlineGeneration);
  };

  const handleOutlineGenerated = (outline: Chapter[]) => {
    setGeneratedOutline(outline);
    let htmlContent = '';
    if (outline.length > 0 && !memoirTitle) {
      // Auto-fill title from first chapter if not already set by user
      setMemoirTitle(outline[0].title);
    }
    outline.forEach(chapter => {
      htmlContent += `<h2>${chapter.title}</h2>`;
      if (chapter.summary) {
        htmlContent += `<p>${chapter.summary}</p>`;
      }
      htmlContent += `<p></p>`;
    });
    setEditorContent(htmlContent);
    setCurrentStep(CreationStep.Editing);
  };

  const handleEditorContentChange = (html: string) => {
    setEditorContent(html);
  };

  const handleSaveMemoir = async () => {
    if (!editorRef.current) {
      setSaveError("Editor instance not available.");
      setCurrentStep(CreationStep.Error);
      return;
    }
    if (!memoirTitle.trim()) {
      setSaveError("Memoir title is required.");
      // Optionally, stay in Editing step but show error near title input
      // For now, just an alert or simple error display.
      alert("Memoir title is required.");
      return;
    }

    const currentHtmlContent = editorRef.current.getHTML();
    setCurrentStep(CreationStep.Saving);
    setSaveError(null);

    const memoirDataToSave: MemoirData = {
      title: memoirTitle,
      content_html: currentHtmlContent,
      transcribed_text: transcribedText,
      // Backend expects chapters as JSON string or structured object.
      // For now, let's match ChapterData from api.ts.
      chapters: generatedOutline?.map(ch => ({ title: ch.title, summary: ch.summary })) || [],
    };

    try {
      const savedMemoir = await createMemoir(memoirDataToSave);
      setNewMemoirId(savedMemoir.id); // Assuming createMemoir returns the full memoir including ID
      setCurrentStep(CreationStep.Saved);
      // Redirect after a short delay or on user action
      setTimeout(() => {
        // Redirect to the edit page of the newly created memoir, or profile/home
        navigate(savedMemoir.id ? `/memoirs/edit/${savedMemoir.id}` : '/profile');
      }, 2000);
    } catch (error) {
      console.error("Failed to save memoir:", error);
      setSaveError(error instanceof Error ? error.message : "An unknown error occurred during save.");
      setCurrentStep(CreationStep.Error);
    }
  };

  const renderStepContent = () => {
    // Simple error display for now
    if (currentStep === CreationStep.Error) {
      return (
        <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Error</h2>
            <p>{saveError || "An unexpected error occurred."}</p>
            <button
                onClick={() => setCurrentStep(CreationStep.Editing)}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Return to Editing
            </button>
        </div>
      );
    }
    if (currentStep === CreationStep.Saving) {
        return <div className="text-center p-10"><p className="text-xl text-blue-600 animate-pulse">Saving your memoir...</p></div>;
    }
    if (currentStep === CreationStep.Saved) {
        return (
            <div className="text-center p-10">
                <p className="text-xl text-green-600">Memoir saved successfully!</p>
                <p className="mt-2">Redirecting to your memoir shortly...</p>
                {newMemoirId && <p className="mt-1 text-sm">Memoir ID: {newMemoirId}</p>}
            </div>
        );
    }
    // Default layout for creation steps
    return (
        <>
            {/* Step 1: Voice Recording */}
            <section className={`p-6 bg-white shadow-lg rounded-lg ${currentStep !== CreationStep.Recording ? 'opacity-50 blur-sm' : ''}`}>
                <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Step 1: Record Your Story</h2>
                {currentStep === CreationStep.Recording ? (
                <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
                ) : (
                <p className="text-gray-600">
                    {transcribedText ? "Recording complete. Proceeding to outline..." : "Waiting to start recording..."}
                </p>
                )}
            </section>

            {/* Step 2: Chapter Outline Generation */}
            <section className={`p-6 bg-white shadow-lg rounded-lg mt-8 ${currentStep !== CreationStep.OutlineGeneration ? 'opacity-50 blur-sm' : ''} ${currentStep < CreationStep.OutlineGeneration ? 'hidden' : ''}`}>
                <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Step 2: Review Chapter Outline</h2>
                {currentStep === CreationStep.OutlineGeneration ? (
                <ChapterOutline
                    transcribedText={transcribedText}
                    onOutlineGenerated={handleOutlineGenerated}
                />
                ) : (
                <p className="text-gray-600">
                    {generatedOutline ? "Chapter outline generated. Proceeding to editor..." : transcribedText ? "Generating outline..." : "Waiting for recording to complete..."}
                </p>
                )}
            </section>

            {/* Step 3: Rich Text Editing */}
            <section className={`p-6 bg-white shadow-lg rounded-lg mt-8 ${currentStep < CreationStep.Editing ? 'hidden' : ''}`}>
                <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Step 3: Write and Edit Your Memoir</h2>
                <div className="mb-6">
                    <label htmlFor="memoirTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Memoir Title
                    </label>
                    <input
                        type="text"
                        id="memoirTitle"
                        name="memoirTitle"
                        value={memoirTitle}
                        onChange={(e) => setMemoirTitle(e.target.value)}
                        placeholder="Enter your memoir title"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={currentStep > CreationStep.Editing}
                    />
                </div>
                <RichTextEditor
                    initialContent={editorContent}
                    onContentChange={handleEditorContentChange}
                    editorRef={editorRef}
                />
                <div className="mt-6 text-right">
                    <button
                    onClick={handleSaveMemoir}
                    disabled={currentStep !== CreationStep.Editing}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                    >
                    Save Memoir
                    </button>
                </div>
            </section>
        </>
    );
  }


  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create New Memoir</h1>
      {renderStepContent()}
    </div>
  );
};

export default CreateMemoirPage;
