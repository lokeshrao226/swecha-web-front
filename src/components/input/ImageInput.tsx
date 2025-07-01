
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Trash2, Check } from 'lucide-react';
import { toast } from "sonner";

interface ImageInputProps {
  onSubmit: (content: File, contentType: string) => Promise<void>;
}

const ImageInput: React.FC<ImageInputProps> = ({ onSubmit }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      toast.success("Image selected");
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) return;

    setIsSubmitting(true);
    await onSubmit(imageFile, 'image');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Image className="h-5 w-5 text-orange-600" />
            Upload Your Image
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
          />

          {!imageUrl && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 transition-colors"
            >
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to select an image</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}

          {imageUrl && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">Image selected</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                  <Image className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
                <Button onClick={() => {
                  if (imageUrl) URL.revokeObjectURL(imageUrl);
                  setImageUrl(null);
                  setImageFile(null);
                }} variant="outline" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      {imageFile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !imageFile}
            className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Submitting..." : "Submit Image"}
          </Button>
        </div>
      )}

      <div className="h-20"></div>
    </div>
  );
};

export default ImageInput;
