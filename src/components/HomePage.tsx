import React from 'react';
import { FileUploader } from "./FileUploader";
import { RecentBook } from "../App";
import { BookOpen } from "lucide-react";

interface HomePageProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  recentBooks: RecentBook[];
  onOpenRecent: (book: RecentBook) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onFileSelect, isLoading, recentBooks, onOpenRecent }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">IPA Reader</h1>
        <p className="text-xl text-gray-400 mb-8">
          Upload an EPUB file to start reading with phonetic transcriptions.
        </p>
        <FileUploader onFileSelect={onFileSelect} isLoading={isLoading} />
      </div>

      {recentBooks && recentBooks.length > 0 && (
        <div className="w-full max-w-4xl mt-16">
          <h2 className="text-2xl font-semibold mb-6 text-left">Recently Opened</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recentBooks.map((book) => (
              <button
                key={book.title}
                onClick={() => onOpenRecent(book)}
                className="bg-gray-800 rounded-lg p-4 text-left hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-48 object-cover rounded-md mb-3" />
                ) : (
                  <div className="w-full h-48 bg-gray-700 rounded-md mb-3 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-500" />
                  </div>
                )}
                <h3 className="font-semibold truncate">{book.title}</h3>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};