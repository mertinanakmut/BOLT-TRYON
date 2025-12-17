'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, File } from 'lucide-react';

interface UploadAreaProps {
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  error?: string;
  description?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function UploadArea({
  label,
  file,
  onFileChange,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  error,
  description = 'PNG, JPG, or WebP up to 10MB'
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setLocalError('Only image files are allowed');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setLocalError('File size must be less than 10MB');
      return false;
    }

    setLocalError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleRemove = () => {
    onFileChange(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Upload Area */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10'
              : error || localError
              ? 'border-red-300 bg-red-50 dark:border-red-500/50 dark:bg-red-500/5'
              : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3 text-center">
            <div className={`p-3 rounded-lg ${
              isDragging 
                ? 'bg-blue-100 dark:bg-blue-500/20' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Upload className={`w-5 h-5 ${
                isDragging 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Browse files
            </button>
          </div>

          {/* Drag Overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Drop your file here
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* File Preview */
        <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-4">
            {/* Preview Thumbnail */}
            <div className="w-16 h-16 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
              {file.type.startsWith('image/') ? (
                <div className="relative w-full h-full">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <File className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {file.type.split('/')[1].toUpperCase()}
              </p>
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(error || localError) && (
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>
          <p className="text-xs text-red-600 dark:text-red-400">
            {error || localError}
          </p>
        </div>
      )}

      {/* File Requirements */}
      {!file && !error && !localError && (
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>Images only</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>Max 10MB</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>PNG, JPG, WebP</span>
          </div>
        </div>
      )}
    </div>
  );
}