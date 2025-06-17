import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../../services/api';

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setIsRecording(true);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const completeBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        try {
          const audioFile = new File([completeBlob], "voice_input.webm", { type: completeBlob.type });
          const response = await transcribeAudio(audioFile);
          onResult(response.transcription);
        } catch (error) {
          console.error('语音识别失败:', error);
        } finally {
          setIsRecording(false);
        }
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('麦克风访问失败:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const canRecord = !!navigator.mediaDevices?.getUserMedia;

  if (!canRecord) return null;

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className={`p-3 rounded-full flex items-center justify-center ${
        isRecording 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-blue-100 hover:bg-blue-200'
      } transition-colors`}
      aria-label={isRecording ? "停止录音" : "开始语音输入"}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-6 w-6 ${isRecording ? 'text-white' : 'text-blue-700'}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={isRecording 
            ? "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          }
        />
      </svg>
    </button>
  );
};

export default VoiceInputButton;
