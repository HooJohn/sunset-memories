import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceRecorder from '../../components/memoirs/VoiceRecorder';
import ChapterOutline from '../../components/memoirs/ChapterOutline';
// Removed unused Chapter import
import RichTextEditor from '../../components/memoirs/RichTextEditor';
import { Editor } from '@tiptap/react';
import { createMemoir } from '../../services/api'; // Removed unused generateChapters import
import type { CreateMemoirPayload, Chapter as ApiChapter } from '../../services/api';

const CreationStep = {
  Recording: 0,
  OutlineGeneration: 1,
  Editing: 2,
  Saving: 3,
  Saved: 4,
  Error: 5,
} as const;
type CreationStep = typeof CreationStep[keyof typeof CreationStep];

const CreateMemoirPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CreationStep>(CreationStep.Recording);
  const [memoirTitle, setMemoirTitle] = useState<string>('');
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [generatedOutline, setGeneratedOutline] = useState<ApiChapter[] | null>(null); // Store as ApiChapter[]
  const [editorInitialContent, setEditorInitialContent] = useState<string>(''); // For TipTap

  const editorRef = useRef<Editor | null>(null);
  const navigate = useNavigate();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newMemoirId, setNewMemoirId] = useState<string | null>(null);

  const handleTranscriptionComplete = (text: string) => {
    setTranscribedText(text);
    setCurrentStep(CreationStep.OutlineGeneration);
  };

  const handleOutlineGenerated = (outline: ApiChapter[]) => { // Expecting ApiChapter[]
    setGeneratedOutline(outline);
    let htmlContent = '';
    if (outline.length > 0 && !memoirTitle) {
      setMemoirTitle(outline[0].title);
    }
    outline.forEach(chapter => {
      htmlContent += `<h2>${chapter.title}</h2>\n`; // Added newline for better raw HTML readability
      if (chapter.summary) {
        htmlContent += `<p>${chapter.summary}</p>\n`;
      }
      htmlContent += `<p></p>\n`; // Empty paragraph for writing space
    });
    setEditorInitialContent(htmlContent);
    setCurrentStep(CreationStep.Editing);
  };

  // This callback is for RichTextEditor's onContentChange, if we needed to sync state continuously.
  // const handleEditorContentChange = (html: string) => {
  //   // setEditorContent(html); // Not strictly needed if we get content from ref on save
  // };

  const handleSaveMemoir = async () => {
    if (!editorRef.current) {
      setSaveError("Editor instance not available.");
      setCurrentStep(CreationStep.Error);
      return;
    }
    if (!memoirTitle.trim()) {
      alert("Memoir title is required."); // Simple alert, could be improved
      return;
    }

    const currentHtmlContent = editorRef.current.getHTML();
    setCurrentStep(CreationStep.Saving);
    setSaveError(null);

    const memoirPayload: CreateMemoirPayload = {
      title: memoirTitle,
      content_html: currentHtmlContent,
      transcribed_text: transcribedText || undefined, // Send undefined if null
      chapters: generatedOutline || undefined, // Send the structured outline
    };

    try {
      const savedMemoir = await createMemoir(memoirPayload);
      setNewMemoirId(savedMemoir.id);
      setCurrentStep(CreationStep.Saved);
      setTimeout(() => {
        navigate(savedMemoir.id ? `/memoirs/edit/${savedMemoir.id}` : '/profile');
      }, 2000);
    } catch (error) {
      console.error("Failed to save memoir:", error);
      setSaveError(error instanceof Error ? error.message : "An unknown error occurred during save.");
      setCurrentStep(CreationStep.Error);
    }
  };

  const renderStepContent = () => {
    if (currentStep === CreationStep.Error) {
      return (
        <div className="p-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">保存回忆录时出错</h2>
            <p>{saveError || "发生未知错误"}</p>
            <button
                type="button"
                onClick={() => setCurrentStep(CreationStep.Editing)}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                返回编辑
            </button>
        </div>
      );
    }
    if (currentStep === CreationStep.Saving) {
        return <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="text-xl text-blue-600 dark:text-blue-400 mt-4">保存中...</p></div>;
    }
    if (currentStep === CreationStep.Saved) {
        return (
            <div className="text-center p-10">
                <p className="text-xl text-green-600 dark:text-green-400">回忆录保存成功!</p>
                <p className="mt-2 dark:text-gray-300">即将重定向到您的回忆录...</p>
                {newMemoirId && <p className="mt-1 text-sm dark:text-gray-400">回忆录ID: {newMemoirId}</p>}
            </div>
        );
    }
    return (
        <>
            <section className={`p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg ${currentStep !== CreationStep.Recording ? 'opacity-60 blur-[2px]' : ''}`}>
                <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400">步骤1: 录制您的故事</h2>
                {currentStep === CreationStep.Recording ? (
                <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
                ) : (
                <p className="text-gray-600 dark:text-gray-300">
                    {transcribedText ? "录制完成，正在处理大纲..." : "等待开始录制..."}
                </p>
                )}
            </section>

            <section className={`p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-8 ${currentStep !== CreationStep.OutlineGeneration ? 'opacity-60 blur-[2px]' : ''} ${currentStep < CreationStep.OutlineGeneration ? 'hidden' : ''}`}>
                <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400">步骤2: 查看章节大纲</h2>
                {currentStep === CreationStep.OutlineGeneration ? (
                <ChapterOutline
                    transcribedText={transcribedText}
                    onOutlineGenerated={handleOutlineGenerated}
                />
                ) : (
                <p className="text-gray-600 dark:text-gray-300">
                    {generatedOutline ? "章节大纲已生成，正在进入编辑..." : transcribedText ? "正在生成大纲..." : "等待录制完成..."}
                </p>
                )}
            </section>

            <section className={`p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-8 ${currentStep < CreationStep.Editing ? 'hidden' : ''}`}>
                <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-400">步骤3: 撰写和编辑您的回忆录</h2>
                <div className="mb-6">
                    <label htmlFor="memoirTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        回忆录标题
                    </label>
                    <input
                        type="text"
                        id="memoirTitle"
                        name="memoirTitle"
                        value={memoirTitle}
                        onChange={(e) => setMemoirTitle(e.target.value)}
                        placeholder="输入回忆录标题"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        disabled={currentStep > CreationStep.Editing}
                    />
                </div>
                <RichTextEditor
                    initialContent={editorInitialContent}
                    onContentChange={() => {}} // Not strictly needed if getting content from ref
                    editorRef={editorRef}
                />
                <div className="mt-6 text-right">
                    <button
                    type="button"
                    onClick={handleSaveMemoir}
                    disabled={currentStep !== CreationStep.Editing}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 dark:disabled:bg-gray-600"
                    >
                    保存回忆录
                    </button>
                </div>
            </section>
        </>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">创建新回忆录</h1>
      {renderStepContent()}
    </div>
  );
};

export default CreateMemoirPage;
