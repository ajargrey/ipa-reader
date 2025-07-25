// Import and properly export the words dictionary
// The words.js file creates a global variable 'm' with the dictionary

// We need to load the script and then access the global variable
let wordsDict: Record<string, string> | null = null;

// Declare global type
declare global {
  interface Window {
    m?: Record<string, string>;
  }
}

// Load the words.js script dynamically
async function loadWords(): Promise<Record<string, string> | null> {
  if (wordsDict) return wordsDict;
  
  try {
    // Create a script element to load words.js
    const script = document.createElement('script');
    script.src = '/words.js'; // Now loading from public directory
    
    return new Promise((resolve, reject) => {
      script.onload = () => {
        // After script loads, the global 'm' variable should be available
        wordsDict = window.m || null;
        console.log('Words dictionary loaded:', wordsDict ? 'Success' : 'Failed');
        resolve(wordsDict);
      };
      script.onerror = (error) => {
        console.error('Failed to load words.js script:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Failed to load words dictionary:', error);
    return null;
  }
}

// Initialize loading
loadWords();

export { wordsDict, loadWords }; 