import React, { useState } from 'react';
import { X, Expand, Minimize2 } from 'lucide-react';

interface ImagePreviewModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ src, alt, onClose }) => {
  const [fit, setFit] = useState(true);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-[95vw] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white bg-gray-800 bg-opacity-60 hover:bg-opacity-80 p-2 rounded"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <button
          onClick={() => setFit(!fit)}
          className="absolute -top-10 right-12 text-white bg-gray-800 bg-opacity-60 hover:bg-opacity-80 p-2 rounded"
          aria-label="Toggle Fit"
        >
          {fit ? <Expand size={18} /> : <Minimize2 size={18} />}
        </button>
        <div className="overflow-auto bg-black rounded-lg">
          <img
            src={src}
            alt={alt || '预览图'}
            className={fit ? 'object-contain w-[90vw] h-[90vh]' : ''}
          />
        </div>
      </div>
    </div>
  );
};

