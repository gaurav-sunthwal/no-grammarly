"use client";
import { useState, useEffect } from "react";

export default function EnhancedGrammarFixer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  
  // New features state
  const [selectedTone, setSelectedTone] = useState("normal");
  const [targetWordCount, setTargetWordCount] = useState("");
  const [showExplanations, setShowExplanations] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [improvementLevel, setImprovementLevel] = useState("moderate");
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  const tones = [
    { id: "formal", name: "Formal", icon: "👔", desc: "Professional & academic" },
    { id: "casual", name: "Casual", icon: "😊", desc: "Friendly & conversational" },
    { id: "funny", name: "Funny", icon: "😄", desc: "Humorous & entertaining" },
    { id: "normal", name: "Normal", icon: "📝", desc: "Balanced & natural" },
    { id: "persuasive", name: "Persuasive", icon: "🎯", desc: "Compelling & convincing" },
    { id: "creative", name: "Creative", icon: "🎨", desc: "Artistic & imaginative" }
  ];

  const languages = [
    { id: "english", name: "English" },
    { id : "hindi", name: "Hindi" },
    { id: "spanish", name: "Spanish" },
    { id: "chinese", name: "Chinese" },
    { id: "japanese", name: "Japanese" },
    { id: "korean", name: "Korean" },
    { id: "russian", name: "Russian" },
    { id: "arabic", name: "Arabic" },
    { id: "portuguese", name: "Portuguese" },
    { id: "turkish", name: "Turkish" },
    { id: "french", name: "French" },
    { id: "german", name: "German" },
    { id: "italian", name: "Italian" }
  ];

  const improvementLevels = [
    { id: "light", name: "Light Touch", desc: "Minimal changes, preserve original style" },
    { id: "moderate", name: "Moderate", desc: "Balanced corrections and improvements" },
    { id: "heavy", name: "Heavy Rewrite", desc: "Comprehensive improvements and restructuring" }
  ];

  useEffect(() => {
    const storedApiKey = localStorage.getItem("gemini_api_key");
    const storedHistory = localStorage.getItem("grammar_history");
    
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setShowApiKeyForm(true);
    }

    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      setShowApiKeyForm(false);
    }
  };

  const saveToHistory = (original, corrected, settings) => {
    const newEntry = {
      id: Date.now(),
      original,
      corrected,
      settings,
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [newEntry, ...history.slice(0, 9)]; // Keep only last 10
    setHistory(newHistory);
    localStorage.setItem("grammar_history", JSON.stringify(newHistory));
  };

  const buildPrompt = () => {
    // Tone instructions
    const toneInstructions = {
      formal: "formal, professional, and suitable for academic or business contexts",
      casual: "casual, friendly, and conversational with natural, everyday language",
      funny: "humorous and entertaining while maintaining clarity",
      normal: "balanced and natural, clear and easy to understand",
      persuasive: "compelling and convincing with strong, confident phrasing",
      creative: "creative with vivid descriptions and imaginative language"
    };

    // Improvement level instructions
    const levelInstructions = {
      light: "Make minimal changes, only fix essential grammar, spelling, and punctuation errors",
      moderate: "Fix errors and make moderate improvements to clarity and flow",
      heavy: "Completely rewrite and restructure for maximum clarity and impact"
    };

    let prompt = `CRITICAL: You must respond ONLY in this exact JSON format, no other text:

{
  "corrected_text": "your corrected text here"${showExplanations ? ',\n  "explanation": "brief explanation of changes"' : ''}
}

Instructions:
- You are an expert ${selectedLanguage} grammar corrector
- Make the text ${toneInstructions[selectedTone]}
- ${levelInstructions[improvementLevel]}`;

    if (targetWordCount) {
      prompt += `\n- Target approximately ${targetWordCount} words`;
    }

    if (preserveFormatting) {
      prompt += `\n- Preserve formatting like line breaks and paragraph structure`;
    }

    prompt += `\n- NEVER include explanations, introductions, or extra text outside the JSON
- NEVER say "here's the corrected text" or similar phrases
- RETURN ONLY THE JSON FORMAT ABOVE

Text to improve: "${input}"`;

    return prompt;
  };

  const fixGrammar = async () => {
    setLoading(true);
    const storedApiKey = localStorage.getItem("gemini_api_key");

    if (!storedApiKey) {
      alert("API Key missing. Please enter it first.");
      setLoading(false);
      return;
    }

    try {
      const prompt = buildPrompt();

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          text: `You are a grammar correction AI. Respond with ONLY the corrected text, no explanations, no introductions, no extra words. Just return the improved text directly.

Make it ${selectedTone} tone. ${improvementLevel === 'light' ? 'Fix only grammar/spelling errors.' : improvementLevel === 'moderate' ? 'Fix errors and improve clarity.' : 'Rewrite for maximum clarity.'}${targetWordCount ? ` Target ${targetWordCount} words.` : ''}${preserveFormatting ? ' Preserve formatting.' : ''}

Text: ${input}`,
          apiKey: storedApiKey,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setOutput(`API Error: ${res.status} - ${errorText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        let result = data.corrected || "Error occurred";
        
        // Clean up any unwanted prefixes or explanations
        result = result.replace(/^(Here's the corrected text:|Here is the corrected text:|Corrected text:|Fixed text:)/i, '').trim();
        result = result.replace(/^["']|["']$/g, '').trim(); // Remove quotes
        
        setOutput(result);
        
        // Save to history
        const settings = {
          tone: selectedTone,
          language: selectedLanguage,
          level: improvementLevel,
          targetWordCount,
          explanations: showExplanations
        };
        saveToHistory(input, result, settings);
        setCurrentHistoryIndex(0);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setOutput("Network error: Please check if the server is running and try again.");
      } else {
        setOutput(`Error: ${error.message || "Unknown error occurred"}`);
      }
    }
    setLoading(false);
  };

  const loadFromHistory = (entry) => {
    setInput(entry.original);
    setOutput(entry.corrected);
    setSelectedTone(entry.settings.tone);
    setSelectedLanguage(entry.settings.language);
    setImprovementLevel(entry.settings.level);
    setTargetWordCount(entry.settings.targetWordCount || "");
    setShowExplanations(entry.settings.explanations);
  };

  const getWordCount = (text) => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  const getSentenceCount = (text) => {
    return text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  };

  if (showApiKeyForm) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Enhanced Grammar AI</h1>
            <p className="text-gray-300 text-sm">Advanced writing assistant with tone control & smart features</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Google Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key here..."
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={saveApiKey}
              disabled={!apiKey.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save & Continue
            </button>

            <div className="text-xs text-gray-400 text-center">
              <p>Don't have an API key? Get one from</p>
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                Google AI Studio
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Enhanced Grammar AI
          </h1>
          <p className="text-gray-300">Advanced writing assistant with tone control, style options, and smart features</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Settings Panel */}
          

          {/* Main Content */}
          <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Your Text
                  </div>
                  <div className="text-sm text-gray-400">
                    {getWordCount(input)} words · {getSentenceCount(input)} sentences
                  </div>
                </h2>
                <textarea
                  placeholder="Type or paste your text here to improve with AI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={12}
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-400">{input.length} characters</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setInput("")}
                      className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 rounded hover:bg-white/10"
                    >
                      Clear
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setInput(text);
                        } catch (err) {
                          console.error('Failed to read clipboard:', err);
                        }
                      }}
                      className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 rounded hover:bg-white/10"
                    >
                      Paste
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={fixGrammar}
                disabled={loading || !input.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enhance Text ({selectedTone})
                  </>
                )}
              </button>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enhanced Text
                  </div>
                  {output && (
                    <div className="text-sm text-gray-400">
                      {getWordCount(output)} words · {getSentenceCount(output)} sentences
                    </div>
                  )}
                </h2>
                {output ? (
                  <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 max-h-80 overflow-y-auto">
                      <pre className="text-white leading-relaxed whitespace-pre-wrap font-sans">{output}</pre>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(output.split('---EXPLANATION---')[0].trim())}
                        className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Text
                      </button>
                      <button
                        onClick={() => setInput(output.split('---EXPLANATION---')[0].trim())}
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Use as Input
                      </button>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setSelectedTone('formal');
                          // Auto-run if we have input
                          if (input.trim()) setTimeout(fixGrammar, 100);
                        }}
                        className="py-1 px-2 bg-purple-600/20 hover:bg-purple-600/40 rounded text-xs transition-colors"
                      >
                        Make Formal
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTone('casual');
                          if (input.trim()) setTimeout(fixGrammar, 100);
                        }}
                        className="py-1 px-2 bg-blue-600/20 hover:bg-blue-600/40 rounded text-xs transition-colors"
                      >
                        Make Casual
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTone('funny');
                          if (input.trim()) setTimeout(fixGrammar, 100);
                        }}
                        className="py-1 px-2 bg-yellow-600/20 hover:bg-yellow-600/40 rounded text-xs transition-colors"
                      >
                        Add Humor
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mb-2">Your enhanced text will appear here</p>
                    <p className="text-sm">Try different tones and settings to match your needs</p>
                  </div>
                )}
              </div>

              {/* Quick Templates */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Start Templates
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setInput("I am writing to express my interest in the position advertised on your website. I believe my skills and experience make me a strong candidate.")}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm transition-colors"
                  >
                    <div className="font-medium text-blue-400 mb-1">📧 Email Template</div>
                    <div className="text-gray-300">Professional email draft</div>
                  </button>
                  <button
                    onClick={() => setInput("Hey everyone! Hope you're all doing great. Just wanted to share some exciting news with you all about my recent project.")}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm transition-colors"
                  >
                    <div className="font-medium text-green-400 mb-1">💬 Social Post</div>
                    <div className="text-gray-300">Casual social media content</div>
                  </button>
                  <button
                    onClick={() => setInput("The research findings indicate that there is a significant correlation between the variables studied in this comprehensive analysis.")}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm transition-colors"
                  >
                    <div className="font-medium text-purple-400 mb-1">📚 Academic Text</div>
                    <div className="text-gray-300">Scholarly writing sample</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Writing Style
              </h3>

              {/* Tone Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tone & Voice</label>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`p-3 rounded-lg text-sm border transition-all duration-200 ${
                        selectedTone === tone.id
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-lg mb-1">{tone.icon}</div>
                      <div className="font-medium">{tone.name}</div>
                      <div className="text-xs opacity-75">{tone.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-gray-800">{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Improvement Level */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Improvement Level</label>
                <div className="space-y-2">
                  {improvementLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setImprovementLevel(level.id)}
                      className={`w-full p-2 rounded-lg text-sm text-left transition-all duration-200 ${
                        improvementLevel === level.id
                          ? "bg-green-600 text-white"
                          : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <div className="font-medium">{level.name}</div>
                      <div className="text-xs opacity-75">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Word Count</label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={targetWordCount}
                    onChange={(e) => setTargetWordCount(e.target.value)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Show explanations</span>
                  <button
                    onClick={() => setShowExplanations(!showExplanations)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      showExplanations ? "bg-blue-600" : "bg-gray-600"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      showExplanations ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Preserve formatting</span>
                  <button
                    onClick={() => setPreserveFormatting(!preserveFormatting)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      preserveFormatting ? "bg-blue-600" : "bg-gray-600"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      preserveFormatting ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* History Panel */}
            {history.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent History
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.slice(0, 5).map((entry, index) => (
                    <button
                      key={entry.id}
                      onClick={() => loadFromHistory(entry)}
                      className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs text-blue-400">{entry.settings.tone}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-gray-300 line-clamp-2">{entry.original.substring(0, 60)}...</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats & Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-blue-400">{getWordCount(input) || 0}</div>
            <div className="text-sm text-gray-300">Input Words</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-green-400">{getWordCount(output) || 0}</div>
            <div className="text-sm text-gray-300">Output Words</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-purple-400">{history.length}</div>
            <div className="text-sm text-gray-300">Total Corrections</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem("grammar_history");
              }}
              className="hover:text-white transition-colors underline"
            >
              Clear History
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("gemini_api_key");
                setShowApiKeyForm(true);
                setApiKey("");
              }}
              className="hover:text-white transition-colors underline"
            >
              Change API Key
            </button>
            <button
              onClick={() => {
                const settings = {
                  tone: selectedTone,
                  language: selectedLanguage,
                  level: improvementLevel,
                  targetWordCount,
                  explanations: showExplanations,
                  preserveFormatting
                };
                localStorage.setItem("grammar_settings", JSON.stringify(settings));
                alert("Settings saved!");
              }}
              className="hover:text-white transition-colors underline"
            >
              Save Settings
            </button>
          </div>
          <div className="text-xs text-gray-500">
            ✨ Enhanced with AI-powered tone control, multi-language support, and smart writing assistance
          </div>
        </div>
      </div>
    </div>
  );
}