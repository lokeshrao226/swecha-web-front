
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Square, Trash2, Check } from 'lucide-react';
import { toast } from "sonner";

interface AudioInputProps {
  onSubmit: (content: Blob, contentType: string) => Promise<void>;
}

const AudioInput: React.FC<AudioInputProps> = ({ onSubmit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Audio recording started");
    } catch (error) {
      toast.error("Failed to start audio recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    toast.success("Recording completed");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;

    setIsSubmitting(true);
    await onSubmit(audioBlob, 'audio');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-600" />
            Record Your Audio
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {!audioUrl && (
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
              }`}>
                {isRecording ? (
                  <MicOff className="h-12 w-12 text-red-600" />
                ) : (
                  <Mic className="h-12 w-12 text-blue-600" />
                )}
              </div>
              
              {isRecording && (
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-red-600">
                    {formatTime(recordingTime)}
                  </div>
                  <p className="text-sm text-gray-600">Recording in progress...</p>
                </div>
              )}

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-8 py-3 text-white ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'gradient-purple hover:opacity-90'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="h-5 w-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          )}

          {audioUrl && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-medium">Recording completed</span>
                  </div>
                  <span className="text-sm text-green-600">{formatTime(recordingTime)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => audioUrl && new Audio(audioUrl).play()} variant="outline" className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
                <Button onClick={() => {
                  if (audioUrl) URL.revokeObjectURL(audioUrl);
                  setAudioUrl(null);
                  setAudioBlob(null);
                  setRecordingTime(0);
                }} variant="outline" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      {audioBlob && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !audioBlob}
            className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Submitting..." : "Submit Audio"}
          </Button>
        </div>
      )}

      <div className="h-20"></div>
    </div>
  );
};

export default AudioInput;
