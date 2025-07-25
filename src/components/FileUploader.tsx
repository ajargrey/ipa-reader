import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUploader({ onFileSelect, isLoading }: FileUploaderProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const epubFile = files.find(file => 
      file.name.toLowerCase().endsWith('.epub') || 
      file.type === 'application/epub+zip'
    );
    
    if (epubFile) {
      onFileSelect(epubFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors duration-200"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-700">
              {isLoading ? 'Processing EPUB...' : 'Upload EPUB File'}
            </h3>
            <p className="text-gray-500">
              {isLoading 
                ? 'Please wait while we parse your book'
                : 'Drag and drop your EPUB file here, or click to browse'
              }
            </p>
          </div>

          {!isLoading && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".epub,application/epub+zip"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Choose File</span>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Supported format: EPUB (.epub)</p>
        <p className="mt-1">
          The IPA Reader will convert text to International Phonetic Alphabet notation
        </p>
      </div>
    </div>
  );
}