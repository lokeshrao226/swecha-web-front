
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Type, Mic, MicOff, Play, Square, Trash2 } from 'lucide-react';
import { toast } from "sonner";

interface ContentInputProps {
  token: string;
  onBack: () => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ token, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('People');
  const [inputMethod, setInputMethod] = useState<'text' | 'audio' | null>(null);
  const [textContent, setTextContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const categories = ['People', 'Places', 'Events', 'Objects', 'Ideas'];

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
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
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast.success("Recording completed");
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!inputMethod) {
      toast.error("Please select an input method");
      return;
    }

    if (inputMethod === 'text' && !textContent.trim()) {
      toast.error("Please enter some text content");
      return;
    }

    if (inputMethod === 'audio' && !audioBlob) {
      toast.error("Please record some audio content");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('category', selectedCategory);
      formData.append('content_type', inputMethod);

      if (inputMethod === 'text') {
        formData.append('text_content', textContent);
      } else if (inputMethod === 'audio' && audioBlob) {
        formData.append('audio_file', audioBlob, 'recording.webm');
      }

      const response = await fetch('https://backend2.swecha.org/content/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success(`Content submitted successfully! (${textContent.split(' ').length} words)`);
        
        // Reset form
        setTextContent('');
        setAudioBlob(null);
        setAudioUrl(null);
        setInputMethod(null);
        setRecordingTime(0);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to submit content");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (!inputMethod) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Choose Input Method</h1>
              <p className="text-sm text-gray-600">How would you like to share your content?</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Selected Category */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 gradient-purple rounded-2xl flex items-center justify-center">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Selected Category</p>
                  <Badge className="gradient-purple text-white px-4 py-2 text-lg">
                    {selectedCategory}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Method Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Type className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Select Input Method</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Choose how you want to add your content</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Text Input */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setInputMethod('text')}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                      <Type className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">Text Input</h3>
                      <p className="text-gray-600 text-sm">Type your content</p>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Tap to select →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Recording */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setInputMethod('audio')}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Mic className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">Audio Recording</h3>
                      <p className="text-gray-600 text-sm">Record your voice</p>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Tap to select →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setInputMethod(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {inputMethod === 'text' ? 'Text Input' : 'Audio Recording'}
            </h1>
            <p className="text-sm text-gray-600">Category: {selectedCategory}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {inputMethod === 'text' && (
          <Card className="animate-fade-in-up">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Type className="h-5 w-5 text-green-600" />
                Enter Your Content
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your content here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Words: {textContent.split(' ').filter(word => word.length > 0).length}</span>
                <span>Characters: {textContent.length}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {inputMethod === 'audio' && (
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
                    <Button onClick={playRecording} variant="outline" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                    <Button onClick={deleteRecording} variant="outline" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (inputMethod === 'text' && !textContent.trim()) || (inputMethod === 'audio' && !audioBlob)}
            className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Submitting..." : "Submit Content"}
          </Button>
        </div>

        {/* Success Message Area */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default ContentInput;
