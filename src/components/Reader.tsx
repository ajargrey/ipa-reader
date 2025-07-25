import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  X,
  Sun,
  Moon,
  Plus,
  Minus,
  Type,
  Bold,
  Zap,
  Feather,
  Circle
} from 'lucide-react';
import { EpubBook, ReaderSettings } from '../types/epub';
import { convertTextToIPA } from '../utils/ipaConverter';
import useLocalStorage from '../hooks/useLocalStorage';

interface ReaderProps {
  book: EpubBook;
  onClose: () => void;
}

export function Reader({ book, onClose }: ReaderProps) {
  const [currentChapter, setCurrentChapter] = useLocalStorage(`reader-chapter-${book.title}`, 0);
  const [settings, setSettings] = useLocalStorage<ReaderSettings>('reader-settings', {
    showIPA: true,
    fontSize: 18,
    theme: 'dark',
    stressDisplay: 'bold',
    showAspiration: true,
    showFlapping: true,
    showGlottalStop: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load scroll position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem(`reader-scroll-${book.title}`);
    if (contentRef.current && savedPosition) {
      contentRef.current.scrollTop = JSON.parse(savedPosition);
    }
  }, [book.title, currentChapter]);

  // Save scroll position on scroll
  useEffect(() => {
    const contentEl = contentRef.current;
    const handleScroll = () => {
      if (contentEl) {
        localStorage.setItem(`reader-scroll-${book.title}`, JSON.stringify(contentEl.scrollTop));
      }
    };
    contentEl?.addEventListener('scroll', handleScroll, { passive: true });
    return () => contentEl?.removeEventListener('scroll', handleScroll);
  }, [book.title]);

  const chapter = book.chapters[currentChapter];
  const displayText = settings.showIPA && chapter 
    ? convertTextToIPA(
        chapter.content, 
        settings.stressDisplay, 
        settings.showAspiration, 
        settings.showFlapping,
        settings.showGlottalStop
      )
    : chapter?.content || '';

  const nextChapter = () => {
    if (currentChapter < book.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const toggleIPA = () => {
    setSettings(prev => ({ ...prev, showIPA: !prev.showIPA }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const adjustFontSize = (delta: number) => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(10, prev.fontSize + delta)
    }));
  };

  const toggleStressDisplay = () => {
    setSettings(prev => ({
      ...prev,
      stressDisplay: prev.stressDisplay === 'marks' ? 'bold' : 'marks'
    }));
  };

  const toggleAspiration = () => {
    setSettings(prev => ({ ...prev, showAspiration: !prev.showAspiration }));
  };

  const toggleFlapping = () => {
    setSettings(prev => ({ ...prev, showFlapping: !prev.showFlapping }));
  };

  const toggleGlottalStop = () => {
    setSettings(prev => ({ ...prev, showGlottalStop: !prev.showGlottalStop }));
  };

  const themeClasses = settings.theme === 'dark'
    ? 'bg-gray-900 text-white'
    : 'bg-white text-gray-900';

  const panelClasses = settings.theme === 'dark'
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen ${themeClasses}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${panelClasses} border-b px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-semibold">{book.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chapter {currentChapter + 1}: {chapter?.title}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* IPA Toggle */}
            <button
              onClick={toggleIPA}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                settings.showIPA
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              IPA
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className={`mt-4 p-4 ${panelClasses} rounded-lg border`}>
            <div className="grid grid-cols-2 gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {settings.theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="text-sm">{settings.theme === 'light' ? 'Dark' : 'Light'} Mode</span>
              </button>

              {/* Font Size */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => adjustFontSize(-1)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm px-2">{settings.fontSize}px</span>
                <button
                  onClick={() => adjustFontSize(1)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Stress Display Toggle (only visible when IPA is enabled) */}
              {settings.showIPA && (
                <button
                  onClick={toggleStressDisplay}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {settings.stressDisplay === 'marks' ? (
                    <Type className="h-4 w-4" />
                  ) : (
                    <Bold className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {settings.stressDisplay === 'marks' ? 'Stress Marks (ˈ)' : 'Bold Stress'}
                  </span>
                </button>
              )}

              {/* Aspiration Toggle (only visible when IPA is enabled) */}
              {settings.showIPA && (
                <button
                  onClick={toggleAspiration}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    settings.showAspiration
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">
                    Aspiration {settings.showAspiration ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {/* Flapping Toggle (only visible when IPA is enabled) */}
              {settings.showIPA && (
                <button
                  onClick={toggleFlapping}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    settings.showFlapping
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Feather className="h-4 w-4" />
                  <span className="text-sm">
                    Flapping (ɾ) {settings.showFlapping ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {/* Glottal Stop Toggle (only visible when IPA is enabled) */}
              {settings.showIPA && (
                <button
                  onClick={toggleGlottalStop}
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                    settings.showGlottalStop
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Circle className="h-4 w-4" />
                  <span className="text-sm">
                    Glottal Stops (ʔ) {settings.showGlottalStop ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}
            </div>

            {/* Aspiration Legend (only visible when aspiration is enabled) */}
            {settings.showIPA && settings.showAspiration && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-0.5 bg-red-600"></span>
                    <span>Strong aspiration (stressed syllable-initial)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-0.5 bg-yellow-500"></span>
                    <span>Weak aspiration (unstressed syllable-initial)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-0.5 bg-gray-400"></span>
                    <span>No aspiration (after /s/, word-final, etc.)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Phonetic Features Legend */}
            {settings.showIPA && (settings.showAspiration || settings.showFlapping || settings.showGlottalStop) && (
              <div className="mt-4 p-3 rounded border bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-medium text-sm mb-2">Legend:</h4>
                <div className="space-y-1 text-xs">
                  {settings.stressDisplay === 'bold' && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-semibold">Blue Bold</span>
                      <span>= Stressed syllables</span>
                    </div>
                  )}
                  {settings.showAspiration && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="underline decoration-red-600 decoration-2">Red underline</span>
                        <span>= Strong aspiration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="underline decoration-yellow-500 decoration-2">Yellow underline</span>
                        <span>= Weak aspiration</span>
                      </div>
                    </>
                  )}
                  {settings.showFlapping && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono">ɾ</span>
                      <span>= Flapped /t/ (tap sound)</span>
                    </div>
                  )}
                  {settings.showGlottalStop && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono">ʔ</span>
                      <span>= Glottal stop (as in "uh-oh")</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div
          ref={contentRef}
          className="prose prose-lg max-w-none leading-relaxed"
          style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.showIPA ? 'serif' : 'inherit'
          }}
        >
          {settings.showIPA && (settings.stressDisplay === 'bold' || settings.showAspiration) ? (
            <div dangerouslySetInnerHTML={{ __html: displayText }} />
          ) : (
            <div className="whitespace-pre-wrap">{displayText}</div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 ${panelClasses} rounded-full border shadow-lg`}>
        <div className="flex items-center">
          <button
            onClick={prevChapter}
            disabled={currentChapter === 0}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-full transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="px-4 py-3 text-sm">
            {currentChapter + 1} / {book.chapters.length}
          </div>
          
          <button
            onClick={nextChapter}
            disabled={currentChapter === book.chapters.length - 1}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-full transition-colors disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}