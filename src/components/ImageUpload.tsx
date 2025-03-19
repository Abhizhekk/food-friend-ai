
import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, X } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Check if running on mobile device
  React.useEffect(() => {
    setIsMobileDevice(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

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

  const activateCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: isMobileDevice ? "environment" : "user" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Couldn't access camera. Please check permissions.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setPreviewImage(imageDataUrl);
      onImageCaptured(imageDataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    stopCamera();
  };

  return (
    <div className="w-full space-y-4 animate-slide-in">
      {!isCameraActive && !previewImage && (
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
              Drag &amp; drop a photo of your food, or click the buttons below to take or upload a picture
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
              </Button>
              
              <Button 
                variant="default" 
                className="flex items-center gap-2"
                onClick={activateCamera}
              >
                <Camera className="h-4 w-4" />
                <span>Take Photo</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCameraActive && (
        <div className="relative rounded-lg overflow-hidden h-96">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full h-12 w-12"
              onClick={stopCamera}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              className="rounded-full h-16 w-16"
              onClick={captureImage}
            >
              <div className="h-10 w-10 rounded-full border-2 border-white" />
            </Button>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="relative rounded-lg overflow-hidden">
          <img 
            src={previewImage} 
            alt="Food preview" 
            className="w-full object-cover max-h-96 rounded-lg animate-fade-in"
          />
          
          <div className="absolute top-2 right-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full h-10 w-10"
              onClick={clearImage}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                <p className="text-sm text-foreground/80">Analyzing your food...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
