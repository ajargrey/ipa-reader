import JSZip from 'jszip';
import { EpubBook, EpubChapter } from '../types/epub';

export class EpubParser {
  private zip: JSZip | null = null;

  async parseEpub(file: File): Promise<EpubBook> {
    this.zip = await JSZip.loadAsync(file);
    
    const opfPath = await this.findOPFFile();
    const opfContent = await this.getFileContent(opfPath);
    const opfDoc = new DOMParser().parseFromString(opfContent, 'text/xml');
    
    const metadata = this.extractMetadata(opfDoc);
    const spine = this.extractSpine(opfDoc);
    const manifest = this.extractManifest(opfDoc);
    
    const chapters = await this.extractChapters(spine, manifest, opfPath);
    
    return {
      title: metadata.title,
      author: metadata.author,
      chapters,
      cover: metadata.cover
    };
  }

  private async findOPFFile(): Promise<string> {
    const containerXml = await this.getFileContent('META-INF/container.xml');
    const containerDoc = new DOMParser().parseFromString(containerXml, 'text/xml');
    const rootfile = containerDoc.querySelector('rootfile');
    return rootfile?.getAttribute('full-path') || 'content.opf';
  }

  private async getFileContent(path: string): Promise<string> {
    if (!this.zip) throw new Error('EPUB not loaded');
    const file = this.zip.file(path);
    if (!file) throw new Error(`File not found: ${path}`);
    return await file.async('text');
  }

  private extractMetadata(opfDoc: Document) {
    const getMetadata = (selector: string) => 
      opfDoc.querySelector(selector)?.textContent || '';

    return {
      title: getMetadata('title') || 'Unknown Title',
      author: getMetadata('creator') || 'Unknown Author',
      cover: null // We'll implement cover extraction later if needed
    };
  }

  private extractSpine(opfDoc: Document): string[] {
    const spineItems = opfDoc.querySelectorAll('spine itemref');
    return Array.from(spineItems).map(item => 
      item.getAttribute('idref') || ''
    ).filter(Boolean);
  }

  private extractManifest(opfDoc: Document): Map<string, string> {
    const manifest = new Map<string, string>();
    const items = opfDoc.querySelectorAll('manifest item');
    
    items.forEach(item => {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      if (id && href) {
        manifest.set(id, href);
      }
    });
    
    return manifest;
  }

  private async extractChapters(
    spine: string[], 
    manifest: Map<string, string>, 
    opfPath: string
  ): Promise<EpubChapter[]> {
    const chapters: EpubChapter[] = [];
    const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);

    for (let i = 0; i < spine.length; i++) {
      const itemId = spine[i];
      const href = manifest.get(itemId);
      
      if (href) {
        const fullPath = basePath + href;
        try {
          const content = await this.getFileContent(fullPath);
          const doc = new DOMParser().parseFromString(content, 'text/html');
          
          // Extract text content and clean it up
          const bodyContent = doc.body || doc.documentElement;
          const textContent = this.extractTextFromHTML(bodyContent);
          
          chapters.push({
            id: itemId,
            title: this.extractChapterTitle(doc) || `Chapter ${i + 1}`,
            content: textContent,
            href: fullPath
          });
        } catch (error) {
          console.warn(`Failed to load chapter ${itemId}:`, error);
        }
      }
    }

    return chapters;
  }

  private extractTextFromHTML(element: Element): string {
    // Remove script and style elements
    const scripts = element.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());

    // Get text content and clean it up
    let text = element.textContent || '';
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Add paragraph breaks
    const paragraphs = element.querySelectorAll('p');
    if (paragraphs.length > 0) {
      text = Array.from(paragraphs)
        .map(p => p.textContent?.trim())
        .filter(Boolean)
        .join('\n\n');
    }

    return text;
  }

  private extractChapterTitle(doc: Document): string | null {
    // Try to find title in various ways
    const titleSelectors = ['h1', 'h2', 'title', '.chapter-title'];
    
    for (const selector of titleSelectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    
    return null;
  }
}