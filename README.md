# Grammar AI Assistant

An AI-powered grammar correction tool built with Next.js and Google Gemini API. Perfect your writing with instant grammar and spelling corrections.

## Features

✨ **Smart Grammar Correction** - AI-powered text correction using Google Gemini  
🔑 **Secure API Key Management** - Store your API key locally in browser storage  
🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations  
📱 **Floating Icon** - Reminds you about the app when typing on any webpage  
📋 **Copy & Paste** - Easy text copying and reuse of corrected content  
🚀 **Fast & Efficient** - Real-time grammar checking and correction  

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd no-grammarly
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Time Setup

1. **Get API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your Gemini API key
2. **Enter API Key**: On the home page, enter your API key and click "Get Started"
3. **Start Writing**: Navigate to the grammar corrector and start improving your text!

## How to Use

### 1. API Key Setup
- Enter your Google Gemini API key on the home page
- The key is stored securely in your browser's local storage
- You can change the API key anytime from the settings

### 2. Grammar Correction
- Type or paste your text in the input area
- Click "Fix Grammar & Spelling" to get AI-powered corrections
- Review the corrected text and copy it to your clipboard
- Use the corrected text as new input for further refinement

### 3. Floating Icon Feature
- A floating icon appears on web pages when you're typing
- Hover over it to see helpful tooltips
- Click to open the grammar assistant in a new tab

## API Endpoints

### POST `/api/gemini`
Corrects grammar and spelling in the provided text.

**Request Body:**
```json
{
  "text": "Your text to correct",
  "apiKey": "your-gemini-api-key"
}
```

**Response:**
```json
{
  "corrected": "Your corrected text"
}
```

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI**: Google Gemini API
- **Icons**: React Icons

## Project Structure

```
no-grammarly/
├── app/
│   ├── api/
│   │   └── gemini.ts          # Gemini API endpoint
│   ├── components/
│   │   └── FloatingIcon.tsx   # Floating icon component
│   ├── correct/
│   │   └── page.tsx           # Grammar correction page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── public/                    # Static assets
├── package.json
└── README.md
```

## Customization

### Styling
- Modify `app/globals.css` for global styles
- Update component-specific styles in each component
- Customize Tailwind classes for different themes

### API Configuration
- Update the Gemini API endpoint in `app/api/gemini.ts`
- Modify the prompt for different types of text correction
- Add additional AI models or services

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables if needed
4. Deploy!

### Other Platforms
- **Netlify**: Build and deploy from the `out` directory
- **Railway**: Deploy directly from GitHub
- **AWS/GCP**: Build and deploy to your preferred cloud platform

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Create an issue on GitHub
- **Questions**: Open a discussion on GitHub
- **Feature Requests**: Submit through GitHub issues

## Acknowledgments

- Google Gemini API for AI capabilities
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- React Icons for the beautiful icon set

---

Made with ❤️ by [Your Name]
# no-grammarly
