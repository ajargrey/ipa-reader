// Enhanced IPA conversion utility - Refactored for whole-text analysis

// Import the words dictionary from our wrapper
import { wordsDict, loadWords } from './wordsImporter';

// Track if we've initialized the dictionary
let isInitialized = false;

// Initialize dictionary loading immediately
loadWords().then(() => {
  isInitialized = true;
  console.log('Dictionary initialization complete');
});

// --- UTILITY & ANALYSIS FUNCTIONS ---

const unstressedFunctionWords = new Set(['A', 'AN', 'THE', 'CAN', 'DO', 'DOES', 'DID', 'WILL', 'WOULD', 'SHALL', 'SHOULD', 'COULD', 'HAVE', 'HAS', 'HAD', 'IS', 'ARE', 'WAS', 'WERE', 'AM', 'BE', 'BEEN', 'BEING', 'TO', 'OF', 'FOR', 'AT', 'IN', 'ON', 'BY', 'WITH', 'FROM', 'UP', 'OUT', 'OFF', 'IT', 'HE', 'SHE', 'WE', 'YOU', 'I', 'AND', 'OR', 'BUT', 'IF', 'AS', 'SO']);

function isVowel(char: string): boolean {
  return /[aeiouæɪɛɔʊʌɜəɒɑ]/.test(char);
}

function isMonosyllabic(ipaText: string): boolean {
  const vowelMatches = ipaText.match(/[aeiouæɪɛɔʊʌɜəɒɑ]/g) || [];
  const diphthongMatches = ipaText.match(/aɪ|eɪ|ɔɪ|aʊ|oʊ|ɪə|ɛə|ʊə/g) || [];
  const vowelCount = vowelMatches.length - (diphthongMatches ? diphthongMatches.length : 0);
  return vowelCount === 1;
}

function addMonosyllabicStress(ipaText: string, originalWord: string): string {
  if (unstressedFunctionWords.has(originalWord.toUpperCase())) {
    return ipaText;
  }
  if (isMonosyllabic(ipaText) && !ipaText.includes('́')) {
    const vowelMatch = ipaText.match(/[aeiouæɪɛɔʊʌɜəɒɑ]/);
    if (vowelMatch?.index !== undefined) {
      const vowelPos = vowelMatch.index;
      return ipaText.slice(0, vowelPos + 1) + '́' + ipaText.slice(vowelPos + 1);
    }
  }
  return ipaText;
}

function findSyllableStart(text: string, vowelPos: number): number {
  if (vowelPos === 0) return 0;
  
  // Find the start of the current word first
  let wordStart = vowelPos;
  while (wordStart > 0 && text[wordStart - 1] !== ' ') wordStart--;
  
  let pos = vowelPos - 1;
  while (pos >= wordStart && !isVowel(text[pos])) pos--;
  
  if (pos >= wordStart && isVowel(text[pos])) {
    const consonantCount = vowelPos - 1 - (pos + 1) + 1;
    if (consonantCount <= 1) return pos + 1;
    return pos + 2;
  }
  return wordStart;
}

function findSyllableEnd(text: string, vowelPos: number): number {
  // Find the end of the current word first
  let wordEnd = vowelPos;
  while (wordEnd < text.length - 1 && text[wordEnd + 1] !== ' ') wordEnd++;
  
  let pos = vowelPos + 1;
  while (pos <= wordEnd && !isVowel(text[pos])) pos++;
  
  if (pos <= wordEnd && isVowel(text[pos])) {
    const consonantCount = pos - 1 - (vowelPos + 1) + 1;
    if (consonantCount <= 1) return vowelPos;
    return vowelPos + 1;
  }
  return wordEnd;
}

function getNextChar(chars: string[], index: number): string | null {
    for (let i = index + 1; i < chars.length; i++) {
        if (chars[i] !== ' ') return chars[i];
    }
    return null;
}

function getPrevChar(chars: string[], index: number): string | null {
    for (let i = index - 1; i >= 0; i--) {
        if (chars[i] !== ' ') return chars[i];
    }
    return null;
}

function determineAspiration(chars: string[], consonantIndex: number, stressedSyllableRanges: { start: number, end: number }[]): 'strong' | 'weak' | 'none' {
  const prevChar = getPrevChar(chars, consonantIndex);
  if (prevChar === 's') return 'none';

  const nextChar = getNextChar(chars, consonantIndex);
  if (!nextChar || (!isVowel(nextChar) && !/[rwjl]/.test(nextChar))) return 'none';
  
  const isStressed = stressedSyllableRanges.some(range => {
      let syllableStartIndex = consonantIndex;
      while (syllableStartIndex > 0 && !isVowel(chars[syllableStartIndex-1]) && chars[syllableStartIndex-1] !== ' ') {
          syllableStartIndex--;
      }
      return syllableStartIndex === range.start;
  });

  if (isStressed) return 'strong';

  // Word-initial is strong
  if (prevChar === null || chars[consonantIndex-1] === ' ') return 'strong';

  return 'weak';
}

// --- UNIFIED RENDERER (Now processes the entire text) ---

function processAndRenderIPA(
  ipaWithDiacritics: string,
  stressMode: 'marks' | 'bold',
  showAspiration: boolean,
  showFlapping: boolean,
  showGlottalStop: boolean
): string {
    // 1. ANALYSIS: Get plain text and find metadata
    const plainIpaChars: string[] = [];
    const stressedVowelIndices: Map<number, number> = new Map(); // Map original index to plain index
    let plainIndex = 0;
    Array.from(ipaWithDiacritics).forEach((char, originalIndex) => {
        if (char === '́') {
            if (plainIpaChars.length > 0) stressedVowelIndices.set(plainIndex - 1, originalIndex);
        } else {
            plainIpaChars.push(char);
            plainIndex++;
        }
    });
    const plainIpa = plainIpaChars.join('');

    const stressedSyllableRanges = Array.from(stressedVowelIndices.keys()).map(vowelIndex => ({
        start: findSyllableStart(plainIpa, vowelIndex),
        end: findSyllableEnd(plainIpa, vowelIndex)
    }));
    
    // A. Determine Flapping First (primarily for /t/, occasionally /d/)
    const flapSet = new Set<number>();
    if (showFlapping) {
        plainIpaChars.forEach((char, i) => {
            // Primary flapping rule: /t/ between vowels when following vowel is unstressed
            if (char === 't') {
                const prevChar = getPrevChar(plainIpaChars, i);
                const nextChar = getNextChar(plainIpaChars, i);
                if (prevChar && (isVowel(prevChar) || prevChar === 'r') && nextChar && isVowel(nextChar)) {
                    let nextVowelIndex = i + 1;
                    while(nextVowelIndex < plainIpaChars.length && !isVowel(plainIpaChars[nextVowelIndex])) {
                        nextVowelIndex++;
                    }
                    const nextSyllableIsStressed = stressedSyllableRanges.some(range => 
                        nextVowelIndex >= range.start && nextVowelIndex <= range.end
                    );
                    if (!nextSyllableIsStressed) {
                        flapSet.add(i);
                    }
                }
            }
            // Secondary flapping: /d/ can occasionally flap in very specific contexts
            // (much less common, mainly in rapid/casual speech)
            // For now, we'll be conservative and not flap /d/ to avoid over-generation
        });
    }

    // B. Determine Glottal Stops (comprehensive rules based on American English phonology)
    const glottalStopSet = new Set<number>();
    if (showGlottalStop) {
        plainIpaChars.forEach((char, i) => {
            if (char === 't') {
                // Skip if this /t/ is already marked for flapping (flapping takes precedence)
                if (flapSet.has(i)) return;

                const prevChar = getPrevChar(plainIpaChars, i);
                const nextChar = getNextChar(plainIpaChars, i);

                // Rule 1: Before syllabic /n/ (button, mountain, certain)
                if (nextChar === 'n' && i + 1 < plainIpaChars.length - 1) {
                    const charAfterN = plainIpaChars[i + 2];
                    if (!charAfterN || charAfterN === ' ' || !isVowel(charAfterN)) {
                        glottalStopSet.add(i);
                        return;
                    }
                }

                // Rule 2: Before syllabic /l/ that's not word-medial (settle → settle but not settle)
                if (nextChar === 'l' && i + 1 < plainIpaChars.length - 1) {
                    const charAfterL = plainIpaChars[i + 2];
                    if (!charAfterL || charAfterL === ' ') {
                        glottalStopSet.add(i);
                        return;
                    }
                }

                // Rule 3: Before /m/ (rhythm, chasm)
                if (nextChar === 'm') {
                    glottalStopSet.add(i);
                    return;
                }

                // Rule 4: Word-finally before consonants (that book, right now)
                if (prevChar && prevChar !== ' ' && nextChar && !isVowel(nextChar) && nextChar !== 'h') {
                    // Check if we're at a word boundary
                    if (i === plainIpaChars.length - 1 || plainIpaChars[i + 1] === ' ') {
                        glottalStopSet.add(i);
                        return;
                    }
                    // Or check if there's a space after this consonant
                    let j = i + 1;
                    while (j < plainIpaChars.length && !isVowel(plainIpaChars[j]) && plainIpaChars[j] !== ' ') {
                        j++;
                    }
                    if (j < plainIpaChars.length && plainIpaChars[j] === ' ') {
                        glottalStopSet.add(i);
                        return;
                    }
                }

                // Rule 5: Word-finally before pause (end of phrase)
                if (!nextChar) {
                    glottalStopSet.add(i);
                    return;
                }

                // Rule 6: After /n/ and before consonants (winter → win'ter, center → cen'ter)
                // This must not apply across word boundaries (e.g., "in time")
                if (prevChar === 'n' && i > 0 && plainIpaChars[i-1] !== ' ' && nextChar && !isVowel(nextChar)) {
                    glottalStopSet.add(i);
                    return;
                }

                // Rule 7: After /r/ and before consonants (quarter → quar'ter)
                // This must not apply across word boundaries (e.g., "or twice")
                if (prevChar === 'r' && i > 0 && plainIpaChars[i-1] !== ' ' && nextChar && !isVowel(nextChar)) {
                    glottalStopSet.add(i);
                    return;
                }
            }
        });
    }
  
    // C. Determine Aspiration, respecting that flapping and glottal stops take precedence
    const aspirationMap = new Map<number, 'strong' | 'weak'>();
    if (showAspiration) {
        plainIpaChars.forEach((char, i) => {
            if (/[ptk]/.test(char)) {
                // Skip if this consonant is marked for flapping or glottal stop
                if ((char === 't' || char === 'd') && (flapSet.has(i) || glottalStopSet.has(i))) return;
                
                const aspiration = determineAspiration(plainIpaChars, i, stressedSyllableRanges);
                if (aspiration !== 'none') aspirationMap.set(i, aspiration);
            }
        });
    }

    // 2. RENDER: Build the final string from the analyzed metadata
    let html = '';
    const isBold = stressMode === 'bold';
    const inBoldRange = (index: number) => isBold && stressedSyllableRanges.some(r => index >= r.start && index <= r.end && plainIpaChars[index] !== ' ');

    for (let i = 0; i < plainIpaChars.length; i++) {
        let char = plainIpaChars[i];

        // Apply transformations in order of precedence
        if (flapSet.has(i)) {
            char = 'ɾ';
        } else if (glottalStopSet.has(i)) {
            char = 'ʔ';
        }
    
        if (isBold && inBoldRange(i) && (i === 0 || !inBoldRange(i - 1))) {
            html += '<span style="color: #2563eb; font-weight: 600;">';
        }
        if (aspirationMap.has(i)) {
            const color = aspirationMap.get(i) === 'strong' ? '#dc2626' : '#eab308';
            html += `<span style="text-decoration: underline; text-decoration-color: ${color}; text-decoration-thickness: 2px;">`;
        }

        if (stressMode === 'marks' && stressedSyllableRanges.some(r => r.start === i)) {
            html += 'ˈ';
        }

        html += char;

        if (aspirationMap.has(i)) {
            html += '</span>';
        }
        if (isBold && inBoldRange(i) && (i === plainIpaChars.length - 1 || !inBoldRange(i + 1))) {
            html += '</span>';
        }
    }
    return html;
}


// --- MAIN EXPORTED FUNCTION (Refactored for whole-text processing) ---

export function convertTextToIPA(text: string, stressMode: 'marks' | 'bold' = 'marks', showAspiration: boolean = false, showFlapping: boolean = false, showGlottalStop: boolean = false): string {
  // 1. Initial Pass: Convert all words to IPA to create a full IPA string
  const wordsAndPunctuation = text.split(/(\b)/);
  let ipaWithDiacritics = '';

  wordsAndPunctuation.forEach(part => {
    if (/\w+/.test(part)) { // It's a word
      const cleanWord = part.toLowerCase();
      const upperWord = cleanWord.toUpperCase();
      if (wordsDict && wordsDict[upperWord]) {
        try {
          let ipaResult = wordsDict[upperWord]
            .replace(/Ã¦/g, 'æ').replace(/É™/g, 'ə').replace(/ÉªÌ/g, 'ɪ').replace(/Éª/g, 'ɪ').replace(/É'/g, 'ɑ')
            .replace(/É"/g, 'ɒ').replace(/Ê'/g, 'ʃ').replace(/Ê"/g, 'ʒ').replace(/É"ÌŒ/g, 'ɔ').replace(/É"/g, 'ɔ')
            .replace(/ÉžÌ/g, 'ɾ').replace(/Éž/g, 'ɾ').replace(/Ã¦Ì/g, 'æ').replace(/É™Ì/g, 'ə').replace(/aÌÊŠ/g, 'aʊ')
            .replace(/eÌª/g, 'eɪ').replace(/aÉª/g, 'aɪ').replace(/oÌÊŠ/g, 'oʊ').replace(/ÉœÌ/g, 'ɜ').replace(/Éœ/g, 'ɜ')
            .replace(/ÊŠ/g, 'ʊ').replace(/Ê‹/g, 'ʋ').replace(/Ì/g, '');
          
          ipaWithDiacritics += addMonosyllabicStress(ipaResult, cleanWord);
        } catch {
          ipaWithDiacritics += part; // Fallback to original word part
        }
      } else {
        ipaWithDiacritics += part; // Word not in dictionary
      }
    } else { // It's punctuation, space, etc.
      ipaWithDiacritics += part;
    }
  });

  // 2. Final Pass: Process and render the entire IPA string
  return processAndRenderIPA(ipaWithDiacritics, stressMode, showAspiration, showFlapping, showGlottalStop);
}

// Async version remains for consistency
export async function convertTextToIPAAsync(text: string, stressMode: 'marks' | 'bold' = 'marks', showAspiration: boolean = false, showFlapping: boolean = false, showGlottalStop: boolean = false): Promise<string> {
  if (!isInitialized) {
    await loadWords();
    isInitialized = true;
  }
  return convertTextToIPA(text, stressMode, showAspiration, showFlapping, showGlottalStop);
}

export function isIPASupported(): boolean {
  const testElement = document.createElement('span');
  testElement.style.fontFamily = 'serif';
  testElement.textContent = 'ɪpə';
  document.body.appendChild(testElement);
  const width = testElement.offsetWidth;
  document.body.removeChild(testElement);
  return width > 0;
}