
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Type } from 'lucide-react';

interface TextInputProps {
  onSubmit: (content: string, contentType: string) => Promise<void>;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit }) => {
  const [textContent, setTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!textContent.trim()) {
      return;
    }

    setIsSubmitting(true);
    await onSubmit(textContent, 'text');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
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

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !textContent.trim()}
          className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity"
        >
          {isSubmitting ? "Submitting..." : "Submit Content"}
        </Button>
      </div>

      <div className="h-20"></div>
    </div>
  );
};

export default TextInput;
