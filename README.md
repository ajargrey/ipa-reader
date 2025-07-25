# IPA Reader

A cross-platform EPUB reader with International Phonetic Alphabet (IPA) text conversion capabilities.

## Features

- 📚 **EPUB Support**: Read any EPUB file with full chapter navigation
- 🔤 **IPA Conversion**: Toggle between regular text and IPA notation
- 🌙 **Dark/Light Theme**: Comfortable reading in any lighting
- 📱 **Cross-Platform**: Web, desktop (Electron), and mobile (Capacitor)
- ⌨️ **Keyboard Shortcuts**: Navigate with arrow keys, toggle IPA with 'I'
- 🎨 **Customizable**: Adjustable font sizes and reading preferences

## Tech Stack

### Core Technologies
- **React 18** with TypeScript for the UI
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons

### EPUB Processing
- **JSZip** for EPUB file extraction
- **Custom EPUB parser** for content extraction
- **DOM Parser** for HTML content processing

### Cross-Platform Deployment
- **Web**: Direct deployment to any web server
- **Desktop**: Electron wrapper for Windows, macOS, Linux
- **Mobile**: Capacitor for iOS and Android apps

### IPA Conversion
- Custom IPA conversion utility (extensible for more languages)
- Font support detection for IPA characters
- Real-time text transformation

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Cross-Platform Development

#### Desktop (Electron)
```bash
# Install Electron
npm install electron electron-builder --save-dev

# Add Electron main process
# Create electron/main.js and package scripts

# Build desktop app
npm run electron:build
```

#### Mobile (Capacitor)
```bash
# Add mobile platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

## Usage

1. **Upload EPUB**: Drag and drop or select an EPUB file
2. **Read**: Navigate through chapters using arrow keys or buttons
3. **Toggle IPA**: Click the IPA button or press 'I' to switch between regular text and phonetic notation
4. **Customize**: Adjust font size, theme, and other reading preferences

## IPA Conversion

The app includes a basic English IPA conversion system. For production use, consider integrating:

- **CMU Pronouncing Dictionary** for comprehensive English phonetics
- **eSpeak** or **Festival** for multi-language support
- **Google Text-to-Speech API** for accurate pronunciations
- **Wiktionary API** for dictionary-based IPA lookups

## Deployment Options

### Web Deployment
- Deploy `dist/` folder to any static hosting service
- Supports Netlify, Vercel, GitHub Pages, etc.

### Desktop Distribution
- Use Electron Builder for creating installers
- Supports Windows (NSIS), macOS (DMG), Linux (AppImage, deb, rpm)

### Mobile App Stores
- iOS: Build with Xcode and deploy to App Store
- Android: Build APK/AAB and deploy to Google Play Store

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Enhanced IPA conversion with multiple language support
- [ ] Audio pronunciation playback
- [ ] Bookmarks and reading progress sync
- [ ] Multiple book library management
- [ ] Annotation and highlighting features
- [ ] Export to various formats
- [ ] Cloud storage integration