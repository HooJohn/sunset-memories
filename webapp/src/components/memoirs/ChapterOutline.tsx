import React, { useState, useEffect } from 'react';

export interface Chapter {
  id: string;
  title: string;
  summary?: string; // Summary is optional for now
  // Potentially timestamps or other metadata from LLM
}

interface ChapterOutlineProps {
  transcribedText: string | null;
  onOutlineGenerated: (outline: Chapter[]) => void;
  // onOutlineError: (error: string) => void; // Optional error callback
}

const ChapterOutline: React.FC<ChapterOutlineProps> = ({
  transcribedText,
  onOutlineGenerated,
  // onOutlineError
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateLLMChapterGeneration = async (text: string): Promise<Chapter[]> => {
    console.log('Simulating LLM chapter generation with text:', text.substring(0, 100) + "...");
    setIsLoading(true);
    setError(null);

    // Simulate network delay and LLM processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock LLM response based on the provided text (simple example)
    // A real LLM would do a much more sophisticated job.
    if (text.toLowerCase().includes("early life") && text.toLowerCase().includes("career")) {
      return [
        { id: '1', title: 'Chapter 1: Early Life and Formative Years', summary: 'A look into the beginning, influences, and early experiences.' },
        { id: '2', title: 'Chapter 2: Career Beginnings and Milestones', summary: 'The journey through professional life, key achievements, and challenges.' },
        { id: '3', title: 'Chapter 3: Reflections and Future Outlook', summary: 'Thoughts on the past and aspirations for what lies ahead.' },
      ];
    } else if (text.toLowerCase().includes("journey")) {
       return [
        { id: '1', title: 'Chapter 1: The Journey Begins', summary: 'Setting out on a new path.' },
        { id: '2', title: 'Chapter 2: Trials Along The Way', summary: 'Overcoming obstacles.' },
      ];
    }
    // Default if no keywords matched
    return [
      { id: '1', title: 'Chapter 1: Introduction', summary: 'An overview of the main themes.' },
      { id: '2', title: 'Chapter 2: Main Narrative', summary: 'The core story and events.' },
      { id: '3', title: 'Chapter 3: Conclusion', summary: 'Final thoughts and takeaways.' },
    ];
  };

  useEffect(() => {
    if (transcribedText && transcribedText.trim() !== "") {
      const generate = async () => {
        try {
          const generatedChapters = await simulateLLMChapterGeneration(transcribedText);
          setChapters(generatedChapters);
          onOutlineGenerated(generatedChapters);
          console.log('Mock chapter outline generated and passed to parent.');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during outline generation.";
          console.error("Outline generation failed:", errorMessage);
          setError(errorMessage);
          // if (onOutlineError) onOutlineError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };
      generate();
    } else {
      // Reset if no text is provided (e.g. user went back a step)
      setChapters([]);
      setIsLoading(false);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcribedText]); // Dependency: re-run when transcribedText changes

  if (!transcribedText) {
    return (
      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
        <p className="text-gray-500 text-center">Waiting for transcribed text to generate outline...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h3 className="text-xl font-semibold mb-3 text-gray-800">Generated Chapter Outline</h3>
      {isLoading && <p className="text-blue-600 animate-pulse">Generating outline, please wait...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!isLoading && !error && chapters.length > 0 && (
        <>
          <ul className="space-y-3">
            {chapters.map(chapter => (
              <li key={chapter.id} className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                <h4 className="font-medium text-lg text-indigo-700">{chapter.title}</h4>
                {chapter.summary && <p className="text-sm text-gray-600 mt-1">{chapter.summary}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-green-600">Outline generated successfully. You can now proceed to the editor.</p>
        </>
      )}
      {!isLoading && !error && chapters.length === 0 && transcribedText && (
        <p className="text-gray-500">No chapters generated based on the provided text.</p>
      )}
    </div>
  );
};

export default ChapterOutline;
