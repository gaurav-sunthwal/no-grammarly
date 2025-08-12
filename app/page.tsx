"use client";
import { useState, useEffect } from "react";
import { FiKey, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Home() {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) window.location.href = "/correct";
  }, []);

  const saveKey = () => {
    if (!apiKey.trim()) return alert("Enter a valid API key");
    localStorage.setItem("gemini_api_key", apiKey.trim());
    window.location.href = "/correct";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <motion.div
        className="bg-white/10 backdrop-blur-lg shadow-2xl p-8 rounded-2xl w-96 border border-white/20"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Grammar AI Assistant
          </h1>
          <p className="text-gray-300 text-sm">
            Your personal writing companion powered by Google Gemini
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Google Gemini API Key</label>
            <div className="flex items-center bg-white/10 border border-white/20 p-3 rounded-lg">
              <FiKey className="text-gray-400 mx-2" />
              <input
                type="password"
                placeholder="Enter your API key here..."
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveKey()}
              />
            </div>
          </div>
          
          <button
            onClick={saveKey}
            disabled={!apiKey.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-xs text-gray-400 text-center mt-6">
          <p>Don't have an API key? Get one from</p>
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Google AI Studio
          </a>
        </div>
      </motion.div>
    </div>
  );
}