"use client";
import { useState, useEffect } from 'react';

export default function FloatingIcon() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Check if there are text inputs on the page
    const checkForTextInputs = () => {
      const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="search"], textarea, [contenteditable="true"]');
      setIsVisible(textInputs.length > 0);
    };

    checkForTextInputs();

    // Listen for new elements being added
    const observer = new MutationObserver(checkForTextInputs);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const openGrammarApp = () => {
    window.open('/correct', '_blank');
  };

  if (!isVisible) return null;

  return (
    <>
      <style jsx>{`
        .floating-icon {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .icon-button {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          border: 3px solid white;
          animation: bounce 1s ease-in-out;
        }

        .icon-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
        }

        .icon-button svg {
          width: 28px;
          height: 28px;
          color: white;
        }

        .tooltip {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 280px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          border: 1px solid #e1e5e9;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .tooltip.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .tooltip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .tooltip-header span {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .tooltip-close {
          background: none;
          border: none;
          font-size: 18px;
          color: #999;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .tooltip-close:hover {
          background-color: #f5f5f5;
          color: #666;
        }

        .tooltip-content {
          padding: 16px 20px 20px;
        }

        .tooltip-content p {
          margin: 0 0 16px 0;
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }

        .tooltip-actions {
          display: flex;
          gap: 8px;
        }

        .tooltip-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tooltip-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .tooltip-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .tooltip-btn.secondary {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
        }

        .tooltip-btn.secondary:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }

        @media (max-width: 768px) {
          .floating-icon {
            bottom: 15px;
            right: 15px;
          }
          
          .icon-button {
            width: 48px;
            height: 48px;
          }
          
          .icon-button svg {
            width: 24px;
            height: 24px;
          }
          
          .tooltip {
            width: 250px;
            right: -10px;
          }
        }
      `}</style>

      <div className="floating-icon">
        <button
          className="icon-button"
          title="Grammar AI Assistant - Click to open"
          onMouseEnter={() => setShowTooltip(true)}
          onClick={openGrammarApp}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </button>

        <div className={`tooltip ${showTooltip ? 'show' : ''}`}>
          <div className="tooltip-header">
            <span>Grammar AI Assistant</span>
            <button 
              className="tooltip-close"
              onClick={() => setShowTooltip(false)}
            >
              &times;
            </button>
          </div>
          <div className="tooltip-content">
            <p>Need help with grammar? Click the icon to open our AI-powered writing assistant!</p>
            <div className="tooltip-actions">
              <button 
                className="tooltip-btn primary"
                onClick={openGrammarApp}
              >
                Open Assistant
              </button>
              <button 
                className="tooltip-btn secondary"
                onClick={() => setShowTooltip(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
