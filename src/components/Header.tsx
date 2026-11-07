/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Shirt, Grid3X3, Maximize2, Code2, Sparkles } from 'lucide-react';

export type AppMode = 'jersey' | 'badge' | 'pattern' | 'upscale' | 'appsScript';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenAppsScriptModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenAppsScriptModal,
}) => {
  return (
    <header className="border-b border-[#232d3f] bg-[#0c1017] px-4 py-3 sticky top-0 z-40">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6351e6] via-[#8574ff] to-[#00f0ff] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-900/30">
            DG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wide text-white font-mono">
                DESIGN GRABBER
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e5a8] bg-[#00e5a8]/10 border border-[#00e5a8]/30 px-2 py-0.5 rounded">
                AI Sublimation Studio
              </span>
            </div>
            <p className="text-[11px] text-[#7d8ca3] leading-none mt-1">
              Extract 2D flat patterns, crest badges &amp; sublimation artwork from 3D mockups
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-[#121924] border border-[#232d3f] p-1 rounded-xl">
          <button
            onClick={() => onSelectMode('jersey')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentMode === 'jersey'
                ? 'bg-gradient-to-r from-[#6e5cf2] to-[#8a7af8] text-white shadow-md'
                : 'text-[#90a0b8] hover:text-white hover:bg-[#1a2333]'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Jersey Grabber (Front+Back)</span>
          </button>

          <button
            onClick={() => onSelectMode('badge')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentMode === 'badge'
                ? 'bg-gradient-to-r from-[#6e5cf2] to-[#8a7af8] text-white shadow-md'
                : 'text-[#90a0b8] hover:text-white hover:bg-[#1a2333]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Badge &amp; Logo Grabber</span>
          </button>

          <button
            onClick={() => onSelectMode('pattern')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentMode === 'pattern'
                ? 'bg-gradient-to-r from-[#6e5cf2] to-[#8a7af8] text-white shadow-md'
                : 'text-[#90a0b8] hover:text-white hover:bg-[#1a2333]'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Pattern Repeater</span>
          </button>

          <button
            onClick={() => onSelectMode('upscale')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentMode === 'upscale'
                ? 'bg-gradient-to-r from-[#6e5cf2] to-[#8a7af8] text-white shadow-md'
                : 'text-[#90a0b8] hover:text-white hover:bg-[#1a2333]'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>AI HD Upscaler</span>
          </button>
        </div>

        {/* Right tools / Google Apps Script Modal Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAppsScriptModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#172130] hover:bg-[#202d42] text-[#c4d3eb] border border-[#2b3a50] transition-colors"
            title="Inspect & Copy Fixed Google Apps Script files"
          >
            <Code2 className="w-3.5 h-3.5 text-[#ffe27a]" />
            <span>Google Apps Script Fix</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 border-l border-[#232d3f] pl-3 text-xs text-[#7d8ca3]">
            <span className="w-2 h-2 rounded-full bg-[#00e5a8] animate-pulse"></span>
            <span>Gemini 3.8 Engine Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
