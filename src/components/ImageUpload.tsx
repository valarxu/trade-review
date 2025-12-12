import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { ImagePreviewModal } from './ImagePreviewModal';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  currentImage?: string;
  onImageRemove?: () => void;
  label: string;
  accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  onImageRemove,
  label,
  accept = 'image/*'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      
      {currentImage ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-700 rounded-lg overflow-hidden">
            <img
              src={currentImage}
              alt="Preview"
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setPreviewOpen(true)}
            />
            {onImageRemove && (
              <button
                onClick={onImageRemove}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors duration-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {previewOpen && currentImage && (
            <ImagePreviewModal src={currentImage} onClose={() => setPreviewOpen(false)} />
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
            isDragging
              ? 'border-green-500 bg-green-500 bg-opacity-10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload size={24} className="text-gray-400" />
            <div className="text-gray-300">
              <p className="text-sm">点击或拖拽图片到此处上传</p>
              <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG、GIF 格式，最大 5MB</p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
};
