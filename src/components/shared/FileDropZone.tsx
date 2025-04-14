
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onDrop: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onDrop,
  maxFiles = 1,
  accept,
  isLoading = false,
  className,
  children
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary',
        className
      )}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Uploading...</span>
        </div>
      ) : children ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center text-sm text-gray-500">
          <Upload className="h-8 w-8 mb-2" />
          <p className="font-medium">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p>or click to browse</p>
        </div>
      )}
    </div>
  );
};
