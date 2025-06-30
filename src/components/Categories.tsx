import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogOut, Grid3X3, Calendar, User, FileText, Upload, MapPin, Type, Mic, Video, Image, X, Check, AlertCircle, Camera, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  title: string;
  description: string;
  published: boolean;
  rank: number;
  created_at: string;
  updated_at: string;
}

interface CategoriesProps {
  token: string;
  onBack: () => void;
  onLogout: () => void;
  onProfile: () => void;
  onContentInput: (categoryId: string, categoryName: string) => void;
}

interface UploadOption {
  type: 'text' | 'audio' | 'video' | 'image';
  icon: React.ReactNode;
  title: string;
  description: string;
  accept: string;
}

const Categories: React.FC<CategoriesProps> = ({ token, onBack, onLogout, onProfile, onContentInput }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [uploadMode, setUploadMode] = useState<'text' | 'audio' | 'video' | 'image' | null>(null);
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [uploading, setUploading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationRequested, setLocationRequested] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const uploadOptions: UploadOption[] = [
    {
      type: 'text',
      icon: <Type className="h-8 w-8" />,
      title: 'Text Input',
      description: 'Type your content',
      accept: ''
    },
    {
      type: 'audio',
      icon: <Mic className="h-8 w-8" />,
      title: 'Audio Recording',
      description: 'Record your voice',
      accept: 'audio/*'
    },
    {
      type: 'video',
      icon: <Video className="h-8 w-8" />,
      title: 'Video Content',
      description: 'Record or upload video',
      accept: 'video/*'
    },
    {
      type: 'image',
      icon: <Camera className="h-8 w-8" />,
      title: 'Photo Capture',
      description: 'Take or upload photos',
      accept: 'image/*'
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (recordingTime > 0 && isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording, recordingTime]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://backend2.swecha.org/api/v1/categories/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Categories Response:', data);
        const publishedCategories = data
          .filter((cat: Category) => cat.published)
          .sort((a: Category, b: Category) => a.rank - b.rank);
        setCategories(publishedCategories);
      } else {
        toast.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error('Categories Error:', error);
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  const getCategoryIcon = (name: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'fables': '📚',
      'events': '🎉',
      'music': '🎵',
      'places': '🏛️',
      'food': '🍽️',
      'people': '👥',
      'literature': '📖',
      'architecture': '🏗️',
      'skills': '⚡',
      'images': '🖼️',
      'culture': '🎭',
      'flora_&_fauna': '🌿',
      'education': '🎓',
      'vegetation': '🌱',
      'folk_songs': '🎶',
      'traditional_skills': '🛠️',
      'local_cultural_history': '🏛️',
      'local_history': '📜',
      'food_agriculture': '🌾',
      'old_newspapers': '📰',
      'folk tales': '📓'
    };
    return iconMap[name] || '📂';
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setShowUploadOptions(true);
  };

  const handleUploadOptionSelect = (option: UploadOption) => {
    setUploadMode(option.type);
    setShowUploadOptions(false);
    if (!locationRequested) {
      requestLocation();
    }
  };

  const requestLocation = () => {
    setLocationError('');
    setLocationRequested(true);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      toast.error("Geolocation not supported");
      return;
    }

    // Show loading state
    toast.info("Requesting location access...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained:', position.coords);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError('');
        toast.success("Location access granted!");
      },
      (error) => {
        console.error('Location error:', error);
        let errorMessage = 'Location access failed. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      const constraints = type === 'audio' 
        ? { audio: true }
        : { audio: true, video: { facingMode: 'user' } };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (type === 'video' && videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const recorder = new MediaRecorder(mediaStream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: type === 'audio' ? 'audio/webm' : 'video/webm' 
        });
        setRecordedBlob(blob);
        setSelectedFile(new File([blob], `recorded-${type}.webm`, { 
          type: blob.type 
        }));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      toast.success(`${type === 'audio' ? 'Audio' : 'Video'} recording started`);
    } catch (error) {
      console.error('Recording error:', error);
      toast.error(`Failed to start ${type} recording. Please check permissions.`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsRecording(false);
    setMediaRecorder(null);
    toast.success('Recording stopped');
  };

  const capturePhoto = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current && canvasRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          const canvas = canvasRef.current!;
          const video = videoRef.current!;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(video, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              setSelectedFile(new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' }));
              toast.success('Photo captured!');
            }
          }, 'image/jpeg', 0.9);
          
          // Stop the stream
          mediaStream.getTracks().forEach(track => track.stop());
        };
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      toast.error('Failed to capture photo. Please check camera permissions.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRecordedBlob(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!selectedCategory || !title.trim()) {
      toast.error("Please provide a title");
      return;
    }

    if (!location) {
      toast.error("Location is required. Please enable location access.");
      requestLocation();
      return;
    }

    if (uploadMode !== 'text' && !selectedFile) {
      toast.error("Please select a file or record content");
      return;
    }

    if (uploadMode === 'text' && !textContent.trim()) {
      toast.error("Please enter text content");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category_id', selectedCategory.id);
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      formData.append('content_type', uploadMode || '');

      if (uploadMode === 'text') {
        formData.append('content', textContent);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }

      let endpoint = 'https://backend2.swecha.org/api/v1/content/';
      
      switch (uploadMode) {
        case 'text':
          endpoint = 'https://backend2.swecha.org/api/v1/content/text/';
          break;
        case 'audio':
          endpoint = 'https://backend2.swecha.org/api/v1/content/audio/';
          break;
        case 'video':
          endpoint = 'https://backend2.swecha.org/api/v1/content/video/';
          break;
        case 'image':
          endpoint = 'https://backend2.swecha.org/api/v1/content/image/';
          break;
        default:
          endpoint = 'https://backend2.swecha.org/api/v1/content/';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        toast.success("Content uploaded successfully!");
        handleBack();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload failed:', errorData);
        toast.error(errorData.message || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Network error. Please check your connection and try again.");
    }

    setUploading(false);
  };

  const handleBack = () => {
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }
    
    setSelectedCategory(null);
    setShowUploadOptions(false);
    setUploadMode(null);
    setTitle('');
    setTextContent('');
    setSelectedFile(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    setLocationRequested(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Upload Interface
  if (uploadMode && selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="gradient-purple text-white p-4 sm:p-6 rounded-b-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1">
                  {uploadOptions.find(opt => opt.type === uploadMode)?.title}
                </h1>
                <p className="text-purple-100 text-sm sm:text-base">
                  {selectedCategory.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <Card className="max-w-2xl mx-auto shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {uploadOptions.find(opt => opt.type === uploadMode)?.icon}
                Upload Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter a title for your content"
                />
              </div>

              {/* Location Status */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600 flex-1">
                  {location ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Location captured ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                    </span>
                  ) : locationError ? (
                    <span className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {locationError}
                    </span>
                  ) : (
                    "Requesting location..."
                  )}
                </span>
                {!location && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestLocation}
                    disabled={!locationRequested && location === null}
                  >
                    {locationRequested ? 'Retry' : 'Get Location'}
                  </Button>
                )}
              </div>

              {/* Content Input based on type */}
              {uploadMode === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-vertical"
                    placeholder="Enter your text content here..."
                  />
                </div>
              )}

              {uploadMode === 'audio' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio Recording *
                  </label>
                  <div className="space-y-4">
                    {!isRecording && !recordedBlob && (
                      <Button
                        onClick={() => startRecording('audio')}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg"
                      >
                        <Mic className="h-5 w-5 mr-2" />
                        Start Recording
                      </Button>
                    )}
                    
                    {isRecording && (
                      <div className="text-center space-y-4">
                        <div className="text-2xl font-bold text-red-500">
                          {formatTime(recordingTime)}
                        </div>
                        <Button
                          onClick={stopRecording}
                          className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                          <Square className="h-5 w-5 mr-2" />
                          Stop Recording
                        </Button>
                      </div>
                    )}
                    
                    {recordedBlob && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-green-700">Recording completed</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRecordedBlob(null);
                              setSelectedFile(null);
                              setRecordingTime(0);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Record Again
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center text-sm text-gray-500">OR</div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="audio-upload"
                      />
                      <label htmlFor="audio-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          {selectedFile && !recordedBlob ? selectedFile.name : 'Upload Audio File'}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {uploadMode === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Recording *
                  </label>
                  <div className="space-y-4">
                    {isRecording && (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full rounded-lg bg-black"
                        style={{ maxHeight: '300px' }}
                      />
                    )}
                    
                    {!isRecording && !recordedBlob && (
                      <Button
                        onClick={() => startRecording('video')}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg"
                      >
                        <Video className="h-5 w-5 mr-2" />
                        Start Video Recording
                      </Button>
                    )}
                    
                    {isRecording && (
                      <div className="text-center space-y-4">
                        <div className="text-2xl font-bold text-red-500">
                          {formatTime(recordingTime)}
                        </div>
                        <Button
                          onClick={stopRecording}
                          className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                          <Square className="h-5 w-5 mr-2" />
                          Stop Recording
                        </Button>
                      </div>
                    )}
                    
                    {recordedBlob && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-green-700">Video recorded successfully</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRecordedBlob(null);
                              setSelectedFile(null);
                              setRecordingTime(0);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Record Again
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center text-sm text-gray-500">OR</div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          {selectedFile && !recordedBlob ? selectedFile.name : 'Upload Video File'}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {uploadMode === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Capture *
                  </label>
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg bg-black hidden"
                      style={{ maxHeight: '300px' }}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    <Button
                      onClick={capturePhoto}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Photo
                    </Button>
                    
                    <div className="text-center text-sm text-gray-500">OR</div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          {selectedFile ? selectedFile.name : 'Upload Image File'}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={uploading || !location || (!textContent.trim() && uploadMode === 'text') || (uploadMode !== 'text' && !selectedFile)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload Content'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Upload Options Screen
  if (showUploadOptions && selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="gradient-purple text-white p-4 sm:p-6 rounded-b-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">Choose Input Method</h1>
                <p className="text-purple-100 text-sm sm:text-lg">
                  How would you like to share your content?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Category Display */}
        <div className="px-4 sm:px-6 py-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Check className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Selected Category</p>
                <p className="font-bold text-purple-600">{selectedCategory.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Options Grid */}
        <div className="px-4 sm:px-6 py-4">
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Select Input Method
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Choose how you want to add your content
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {uploadOptions.map((option) => (
                <Card
                  key={option.type}
                  className="cursor-pointer shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:scale-105 transform"
                  onClick={() => handleUploadOptionSelect(option)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl w-fit mx-auto mb-4">
                      <div className="text-purple-600">
                        {option.icon}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{option.title}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Categories Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="gradient-purple text-white p-4 sm:p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">Categories</h1>
              <p className="text-purple-100 text-sm sm:text-lg">
                Choose a category to share your content
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
              onClick={onProfile}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid3X3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Categories Available</h3>
            <p className="text-gray-500">Categories will appear here once they are published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:scale-105 transform bg-white"
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">
                    {getCategoryIcon(category.name)}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-lg">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(category.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;