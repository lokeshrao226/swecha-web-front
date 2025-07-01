
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Play, Square, Trash2, Check } from 'lucide-react';
import { toast } from "sonner";

interface VideoInputProps {
  onSubmit: (content: Blob, contentType: string) => Promise<void>;
}

const VideoInput: React.FC<VideoInputProps> = ({ onSubmit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      videoRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Video recording started");
    } catch (error) {
      toast.error("Failed to start video recording. Please check camera permissions.");
    }
  };

  const stopRecording = () => {
    if (videoRecorderRef.current && isRecording) {
      videoRecorderRef.current.stop();
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
    if (!videoBlob) return;

    setIsSubmitting(true);
    await onSubmit(videoBlob, 'video');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-red-600" />
            Record Your Video
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          </div>

          {!videoUrl && (
            <div className="flex flex-col items-center space-y-4">
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
                    <Video className="h-5 w-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          )}

          {videoUrl && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-medium">Video recorded</span>
                  </div>
                  <span className="text-sm text-green-600">{formatTime(recordingTime)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => {
                  if (videoRef.current && videoUrl) {
                    videoRef.current.src = videoUrl;
                    videoRef.current.play();
                  }
                }} variant="outline" className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
                <Button onClick={() => {
                  if (videoUrl) URL.revokeObjectURL(videoUrl);
                  setVideoUrl(null);
                  setVideoBlob(null);
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
      {videoBlob && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !videoBlob}
            className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Submitting..." : "Submit Video"}
          </Button>
        </div>
      )}

      <div className="h-20"></div>
    </div>
  );
};

export default VideoInput;
