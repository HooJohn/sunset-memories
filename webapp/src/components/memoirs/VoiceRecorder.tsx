import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../../services/api'; // Import the actual API function

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
    setAudioBlob(null); // Clear previous audio blob
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Ensure the stream is using a common codec if possible, though browser usually handles this.
      // Options for MediaRecorder can be specified here if needed.
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstart = () => {
        setStatusMessage('Recording in progress... Click "Stop Recording" to finish.');
      };

      mediaRecorderRef.current.onstop = async () => {
        const completeBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' }); // Specify MIME type
        setAudioBlob(completeBlob);
        setStatus('stopped');
        setStatusMessage('Recording stopped. Processing transcription...');

        stream.getTracks().forEach(track => track.stop()); // Clean up stream tracks

        // Call actual STT service
        await processTranscription(completeBlob);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setStatus('error');
        setStatusMessage(`Error during recording: ${(event as any)?.error?.message || 'Unknown error'}`);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatus('error');
      if (err instanceof Error && err.name === "NotAllowedError") {
        setStatusMessage('Microphone permission denied. Please enable it in your browser settings.');
      } else {
        setStatusMessage(err instanceof Error ? err.message : 'Error accessing microphone.');
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const processTranscription = async (blob: Blob | null) => {
    if (!blob) {
      setStatus('error');
      setStatusMessage('No audio data to transcribe.');
      return;
    }
    setStatus('transcribing');
    setStatusMessage('Transcribing audio, please wait...');
    try {
      // Convert Blob to File, as backend endpoint might expect a File object
      const audioFile = new File([blob], "audio_recording.webm", { type: blob.type });
      const response = await transcribeAudio(audioFile); // Use actual API
      onTranscriptionComplete(response.transcription);
      setStatusMessage('Transcription complete! Outline generation can now begin.');
      // Optionally keep 'transcribing' status until next step, or set to 'stopped' or a new 'transcribed' status
      setStatus('stopped'); // Or a new status like 'transcribed'
    } catch (error) {
      console.error('Transcription failed:', error);
      setStatus('error');
      setStatusMessage(error instanceof Error ? `Transcription failed: ${error.message}` : 'Transcription failed.');
    }
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
      <p className="mb-4 text-gray-700 dark:text-gray-300 min-h-[40px]">{statusMessage}</p>
      {!['recording', 'transcribing'].includes(status) && (
        <button
          type="button"
          onClick={handleStartRecording}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
          disabled={status === 'recording' || status === 'transcribing'}
        >
          Start Recording
        </button>
      )}
      {status === 'recording' ? (
        <button
          type="button"
          onClick={handleStopRecording}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Stop Recording
        </button>
      ) : null}

      {audioBlob && (status === 'stopped' || status === 'transcribing' || status === 'error' && audioBlob) && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Recorded audio preview:</p>
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full max-w-xs mx-auto mt-2" />
        </div>
      )}
       {status === 'transcribing' && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: "100%"}}></div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
