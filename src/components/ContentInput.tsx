
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Type, Mic, Video, Camera, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import TextInput from './input/TextInput';
import AudioInput from './input/AudioInput';
import VideoInput from './input/VideoInput';
import ImageInput from './input/ImageInput';

interface ContentInputProps {
  token: string;
  onBack: () => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ token, onBack }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [inputType, setInputType] = useState<'text' | 'audio' | 'video' | 'image' | null>(null);

  const inputOptions = [
    {
      type: 'text' as const,
      icon: <Type className="h-8 w-8" />,
      title: t('text_input'),
      description: t('enter_content')
    },
    {
      type: 'audio' as const,
      icon: <Mic className="h-8 w-8" />,
      title: t('audio_input'),
      description: t('upload_audio')
    },
    {
      type: 'video' as const,
      icon: <Video className="h-8 w-8" />,
      title: t('video_input'),
      description: t('upload_video')
    },
    {
      type: 'image' as const,
      icon: <Camera className="h-8 w-8" />,
      title: t('image_input'),
      description: t('upload_image')
    }
  ];

  const handleBack = () => {
    if (inputType) {
      setInputType(null);
    } else {
      onBack();
    }
  };

  // Render specific input component
  if (inputType) {
    const props = { token, onBack: handleBack };
    
    switch (inputType) {
      case 'text':
        return <TextInput {...props} />;
      case 'audio':
        return <AudioInput {...props} />;
      case 'video':
        return <VideoInput {...props} />;
      case 'image':
        return <ImageInput {...props} />;
      default:
        return null;
    }
  }

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
                {t('choose_input_method')}
              </h1>
              <p className="text-purple-100 text-sm sm:text-base">
                {t('add_content')}
              </p>
            </div>
          </div>
          <Button
            onClick={toggleLanguage}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <Globe className="h-4 w-4 mr-1" />
            {language === 'en' ? 'తె' : 'EN'}
          </Button>
        </div>
      </div>

      {/* Input Options Grid */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {inputOptions.map((option) => (
              <Card
                key={option.type}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 rounded-2xl bg-white/80 backdrop-blur-sm"
                onClick={() => setInputType(option.type)}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-purple-600">
                    {option.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .gradient-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </div>
  );
};

export default ContentInput;
