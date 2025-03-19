
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

interface ImageUploadProps {
  onImageCaptured: (imageBase64: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageCaptured }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageDataUrl = event.target.result as string;
        setPreviewImage(imageDataUrl);
        onImageCaptured(imageDataUrl);
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4 animate-slide-in">
      {!previewImage && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center justify-center py-4">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Food Image</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Drag & drop a photo of your food, or click the button below to upload a picture
            </p>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </Button>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="relative">
          <div className="rounded-lg p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Analyzing Food</h3>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                <p className="text-sm text-foreground/80">Analyzing your food...</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Image uploaded successfully. Looking for matching recipes...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
