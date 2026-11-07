/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle, FileCode, Sparkles } from 'lucide-react';
import { APPS_SCRIPT_FILES } from '../utils/appsScriptCode';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<keyof typeof APPS_SCRIPT_FILES>('Grabber.html');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCode = APPS_SCRIPT_FILES[selectedFile];

  const handleCopy = (fileName: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(fileName);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1522] border border-[#2b3a50] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232f42] bg-[#141b29]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ffe27a]/15 text-[#ffe27a] flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Google Apps Script — Fixed &amp; Optimized Source Code
              </h2>
              <p className="text-xs text-[#8393a8]">
                Drop-in replacements for your 5 Google Apps Script files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8594ab] hover:text-white hover:bg-[#202c3e]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Explanation Banner */}
        <div className="p-4 bg-[#1a2335] border-b border-[#28374d] text-xs text-[#cad6e8] leading-relaxed flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#ff9f43] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block text-sm mb-1">
              Why your previous Apps Script code was failing:
            </strong>
            <ul className="list-disc pl-4 space-y-1 text-[#9fb0c6]">
              <li>
                <strong>OpenCV WASM Memory Crash in Grabber.html:</strong> Loading OpenCV.js from external CDN fails inside Google Apps Script's sandboxed iframe due to strict Content Security Policy (CSP) and WebAssembly memory bounds.
              </li>
              <li>
                <strong>Dynamic esm.sh CDN import in JavaScript.html:</strong> Google Apps Script blocks dynamic ES module imports (<code className="text-[#ffe27a]">import('https://esm.sh/@imgly/...')</code>) with CSP network restrictions.
              </li>
              <li>
                <strong>The Solution below:</strong> We replaced both with our pure JavaScript homography matrix engine that executes in 0ms without any external libraries or CDN dependencies!
              </li>
            </ul>
          </div>
        </div>

        {/* File Tabs & Viewer */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar file list */}
          <div className="w-56 bg-[#0a0e16] border-r border-[#202b3c] p-3 flex flex-col gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-[#62738b] uppercase tracking-wider px-2 py-1">
              Your 5 Files
            </span>
            {(Object.keys(APPS_SCRIPT_FILES) as Array<keyof typeof APPS_SCRIPT_FILES>).map((fileName) => {
              const isSelected = selectedFile === fileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium text-left transition-all ${
                    isSelected
                      ? 'bg-[#222e42] text-[#00f0ff] font-bold border border-[#00f0ff]/30'
                      : 'text-[#8495ad] hover:bg-[#131b27] hover:text-white'
                  }`}
                >
                  <span className="truncate">{fileName}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />}
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-[#070b12] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1b2536] bg-[#0c111a]">
              <span className="font-mono text-xs text-[#a2b4cc] font-semibold">
                {selectedFile}
              </span>
              <button
                onClick={() => handleCopy(selectedFile, currentCode)}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-[#1a2536] hover:bg-[#25354d] text-white border border-[#2b3c54]"
              >
                {copiedKey === selectedFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00e5a8]" />
                    <span className="text-[#00e5a8]">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <pre className="font-mono text-xs text-[#cdd8e6] leading-relaxed whitespace-pre font-normal">
                {currentCode}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#232f42] bg-[#121927] flex items-center justify-between">
          <span className="text-xs text-[#7d8ea6]">
            Tip: You can use this AI Web Application directly for immediate 300 DPI exports and Gemini AI scans!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#7b6cf2] hover:bg-[#8b7df5] text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
