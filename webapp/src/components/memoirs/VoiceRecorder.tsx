import React, { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcribedText: string) => void;
}

type RecordingStatus = 'idle' | 'recording' | 'stopped' | 'transcribing' | 'error';

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete }) => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('Click "Start Recording" to begin.');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    setStatus('recording');
    setStatusMessage('Requesting microphone permission...');
    audioChunksRef.current = []; // Clear previous chunks

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstart = () => {
        setStatusMessage('Recording in progress... Click "Stop Recording" to finish.');
        console.log('Recording started successfully.');
      };

      mediaRecorderRef.current.onstop = async () => {
        const completeBlob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0]?.type || 'audio/webm' });
        setAudioBlob(completeBlob);
        setStatus('stopped');
        setStatusMessage('Recording stopped. Simulating transcription...');
        console.log('Recording stopped. Blob created:', completeBlob);

        // Clean up the stream tracks
        stream.getTracks().forEach(track => track.stop());

        // Simulate STT service call
        await simulateSTT(completeBlob);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setStatus('error');
        setStatusMessage('Error during recording. Please check permissions or console.');
         // Clean up the stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatus('error');
      if (err instanceof Error && err.name === "NotAllowedError") {
        setStatusMessage('Microphone permission denied. Please enable it in your browser settings.');
      } else {
        setStatusMessage('Error accessing microphone. See console for details.');
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      // onstop handler will take over
    }
  };

  const simulateSTT = async (blob: Blob) => {
    if (!blob) return;
    setStatus('transcribing');
    setStatusMessage('Transcribing audio... (simulation)');
    console.log('Simulating STT call with audio blob:', blob);

    // Simulate network delay and STT processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    const mockTranscribedText = `This is a mock transcribed text from the recorded audio. It includes details about early life, focusing on key events and experiences. Then it moves on to career development, highlighting significant achievements and challenges faced along the way. Finally, it touches upon personal reflections and future aspirations.`;

    console.log('Mock transcription complete:', mockTranscribedText);
    onTranscriptionComplete(mockTranscribedText);
    setStatusMessage('Transcription complete! Outline generation can now begin.');
  };

  const canRecord = !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;

  if (!canRecord) {
    return (
      <div className="p-4 border border-red-300 rounded-lg text-center bg-red-50">
        <p className="text-red-700">Audio recording is not supported by your browser.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg text-center">
      <p className="mb-4 text-gray-700 min-h-[40px]">{statusMessage}</p>
      {status === 'idle' || status === 'error' || status === 'stopped' && !audioBlob ? (
        <button
          onClick={handleStartRecording}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
          disabled={status === 'recording' || status === 'transcribing'}
        >
          Start Recording
        </button>
      ) : null}
      {status === 'recording' ? (
        <button
          onClick={handleStopRecording}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Stop Recording
        </button>
      ) : null}

      {audioBlob && (status === 'stopped' || status === 'transcribing') && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Recorded audio:</p>
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full max-w-xs mx-auto" />
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
