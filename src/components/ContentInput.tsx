
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Type, Mic, Video, Image, MapPin } from 'lucide-react';
import { toast } from "sonner";
import TextInput from './input/TextInput';
import AudioInput from './input/AudioInput';
import VideoInput from './input/VideoInput';
import ImageInput from './input/ImageInput';

interface ContentInputProps {
  token: string;
  onBack: () => void;
  categoryId?: string;
  categoryName?: string;
}

const ContentInput: React.FC<ContentInputProps> = ({ token, onBack, categoryId, categoryName }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryName || 'People');
  const [inputMethod, setInputMethod] = useState<'text' | 'audio' | 'video' | 'image' | null>(null);
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    // Request location permission when component mounts
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      setLocationPermission('denied');
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      setLocationPermission('granted');
      console.log('Location permission granted:', position.coords);
      return true;
    } catch (error) {
      console.error('Location error:', error);
      setLocationPermission('denied');
      toast.error("Location permission denied. Please enable location access in your browser settings.");
      return false;
    }
  };

  const handleSubmit = async (content: any, contentType: string) => {
    if (locationPermission !== 'granted' || !location) {
      const granted = await requestLocationPermission();
      if (!granted) {
        toast.error("Location permission is required for submission");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('category_id', categoryId || '');
      formData.append('content_type', contentType);
      formData.append('latitude', location!.latitude.toString());
      formData.append('longitude', location!.longitude.toString());

      if (contentType === 'text') {
        formData.append('content', content);
      } else if (contentType === 'audio') {
        formData.append('file', content, 'recording.webm');
      } else if (contentType === 'video') {
        formData.append('file', content, 'recording.webm');
      } else if (contentType === 'image') {
        formData.append('file', content);
      }

      console.log('Submitting to API with data:', {
        category_id: categoryId,
        content_type: contentType,
        latitude: location!.latitude,
        longitude: location!.longitude,
        hasFile: contentType !== 'text'
      });

      const response = await fetch('https://backend2.swecha.org/api/v1/records/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        toast.success(`Content submitted successfully!`);
        
        // Go back to categories after successful submission
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        toast.error(errorData.detail || "Failed to submit content");
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error("Network error. Please try again.");
    }
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

          {/* Location Status */}
          <Card>
            <CardContent className="pt-6">
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                locationPermission === 'granted' ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <MapPin className={`h-5 w-5 ${
                  locationPermission === 'granted' ? 'text-green-600' : 'text-blue-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    locationPermission === 'granted' ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {locationPermission === 'granted' ? 'Location Granted' : 'Location Required'}
                  </p>
                  <p className={`text-xs ${
                    locationPermission === 'granted' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {locationPermission === 'granted' 
                      ? 'Location permission granted successfully' 
                      : 'Location permission will be requested'
                    }
                  </p>
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

            <div className="grid grid-cols-2 gap-4">
              {/* Text Input */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setInputMethod('text')}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                      <Type className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">Text</h3>
                      <p className="text-gray-600 text-sm">Type your content</p>
                    </div>
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
                      <h3 className="font-semibold text-lg">Audio</h3>
                      <p className="text-gray-600 text-sm">Record your voice</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video Recording */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setInputMethod('video')}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                      <Video className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">Video</h3>
                      <p className="text-gray-600 text-sm">Record a video</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setInputMethod('image')}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <Image className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">Image</h3>
                      <p className="text-gray-600 text-sm">Upload a picture</p>
                    </div>
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
              {inputMethod === 'text' && 'Text Input'}
              {inputMethod === 'audio' && 'Audio Recording'}
              {inputMethod === 'video' && 'Video Recording'}
              {inputMethod === 'image' && 'Image Upload'}
            </h1>
            <p className="text-sm text-gray-600">Category: {selectedCategory}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {inputMethod === 'text' && <TextInput onSubmit={handleSubmit} />}
        {inputMethod === 'audio' && <AudioInput onSubmit={handleSubmit} />}
        {inputMethod === 'video' && <VideoInput onSubmit={handleSubmit} />}
        {inputMethod === 'image' && <ImageInput onSubmit={handleSubmit} />}
      </div>
    </div>
  );
};

export default ContentInput;
