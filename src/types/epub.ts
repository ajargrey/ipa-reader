export interface EpubFile {
  id: string;
  name: string;
  content: ArrayBuffer;
}

export interface EpubBook {
  title: string;
  author: string;
  chapters: EpubChapter[];
  coverImage?: string;
}

export interface EpubChapter {
  id: string;
  title: string;
  content: string;
  href: string;
}

export interface ReaderSettings {
  showIPA: boolean;
  fontSize: number;
  theme: 'light' | 'dark';
  stressDisplay: 'marks' | 'bold';
  showAspiration: boolean;
  showFlapping: boolean;
  showGlottalStop: boolean;
}