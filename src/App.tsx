import React from 'react';
import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { Reader } from './components/Reader';
import { EpubParser } from './utils/epubParser';
import { EpubBook } from './types/epub';

function App() {
  const [currentBook, setCurrentBook] = useState<EpubBook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const parser = new EpubParser();
      const book = await parser.parseEpub(file);
      setCurrentBook(book);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse EPUB file');
      console.error('Error parsing EPUB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseReader = () => {
    setCurrentBook(null);
    setError(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Book</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleCloseReader}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (currentBook) {
    return <Reader book={currentBook} onClose={handleCloseReader} />;
  }

  return (
    <HomePage onFileSelect={handleFileSelect} isLoading={isLoading} />
  );
}

export default App;
