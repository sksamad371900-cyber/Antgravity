/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, Sparkles, Palette, Layers, Scissors, Grid2X2 } from 'lucide-react';

export type SublimationLayoutMode = '4-piece-kit' | 'side-by-side';

interface SublimationSettingsProps {
  panelWidth: number;
  panelHeight: number;
  onDimensionsChange: (width: number, height: number) => void;
  deWrinkle: boolean;
  onToggleDeWrinkle: (enabled: boolean) => void;
  layoutMode: SublimationLayoutMode;
  onChangeLayoutMode: (mode: SublimationLayoutMode) => void;
  useSilhouettes: boolean;
  onToggleSilhouettes: (enabled: boolean) => void;
  blankBackNumberBox?: boolean;
  onToggleBlankBackNumberBox?: (enabled: boolean) => void;
  collarColor: string;
  onChangeCollarColor: (color: string) => void;
  colorPalette: { name: string; hex: string; cmyk?: string }[];
  isProcessing: boolean;
  onGenerateFlat: () => void;
  canGenerate: boolean;
}

export const SublimationSettings: React.FC<SublimationSettingsProps> = ({
  panelWidth,
  panelHeight,
  onDimensionsChange,
  deWrinkle,
  onToggleDeWrinkle,
  layoutMode,
  onChangeLayoutMode,
  useSilhouettes,
  onToggleSilhouettes,
  blankBackNumberBox = true,
  onToggleBlankBackNumberBox,
  collarColor,
  onChangeCollarColor,
  colorPalette,
  isProcessing,
  onGenerateFlat,
  canGenerate,
}) => {
  const PRESETS = [
    { label: '6600 × 9000 (Polo Master Print)', w: 6600, h: 9000 },
    { label: '3000 × 4000 (Standard Sublimation)', w: 3000, h: 4000 },
    { label: '4000 × 5500 (Pro Large Kit)', w: 4000, h: 5500 },
  ];

  return (
    <div className="bg-[#121824] border border-[#232f42] rounded-xl p-4 flex flex-col gap-3">
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#8a7af8]">STEP 03</span>
          <h2 className="text-sm font-bold text-white tracking-wide">
            Sublimation Layout &amp; Cut Settings
          </h2>
        </div>
        <span className="text-[11px] font-mono text-[#00e5a8] bg-[#00e5a8]/10 px-2 py-0.5 rounded border border-[#00e5a8]/20">
          {layoutMode === '4-piece-kit' ? '4-Piece Full Kit (Sleeves + Body)' : 'Front + Back Side-by-Side'}
        </span>
      </div>

      {/* Output Format Selector: 4-Piece Master Sheet vs 2-Piece */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#0a0f17] rounded-xl border border-[#222f42]">
        <button
          onClick={() => onChangeLayoutMode('4-piece-kit')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            layoutMode === '4-piece-kit'
              ? 'bg-gradient-to-r from-[#6e5cf2] to-[#8a7af8] text-white shadow-md'
              : 'text-[#8193aa] hover:text-white hover:bg-[#151f2e]'
          }`}
        >
          <Grid2X2 className="w-4 h-4 text-[#ffe27a]" />
          <span>4-Piece Master Kit (Reference)</span>
        </button>

        <button
          onClick={() => onChangeLayoutMode('side-by-side')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            layoutMode === 'side-by-side'
              ? 'bg-gradient-to-r from-[#6e5cf2] to-[#8a7af8] text-white shadow-md'
              : 'text-[#8193aa] hover:text-white hover:bg-[#151f2e]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Front &amp; Back Only</span>
        </button>
      </div>

      {/* Preset dimension buttons */}
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((p, idx) => {
          const isSelected = panelWidth === p.w && panelHeight === p.h;
          return (
            <button
              key={idx}
              onClick={() => onDimensionsChange(p.w, p.h)}
              className={`p-2 rounded-lg text-left border transition-all text-xs ${
                isSelected
                  ? 'border-[#7b6cf2] bg-[#1a1c31] text-white shadow-sm'
                  : 'border-[#232f42] bg-[#0d131f] text-[#8696ae] hover:border-[#384a66] hover:text-white'
              }`}
            >
              <span className="font-bold block truncate">{p.w} × {p.h} px</span>
              <span className="text-[10px] text-[#6d7e96] block truncate">
                {p.label.split('(')[1]?.replace(')', '') || 'Preset'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Silhouette Die-Cut / Crewneck Toggle (As in reference image!) */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d131e] border border-[#212c3f]">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#00f0ff]" />
          <div>
            <span className="text-xs font-bold text-white block">
              Apparel Die-Cut Silhouettes (Neck Scoop, Raglan &amp; Sleeves)
            </span>
            <span className="text-[11px] text-[#6e7e95]">
              Cuts patterns into real garment sewing shapes with curved sleeve bell caps
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={useSilhouettes}
            onChange={(e) => onToggleSilhouettes(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#253246] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00f0ff]"></div>
        </label>
      </div>

      {/* De-Wrinkle Filter Toggle */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d131e] border border-[#212c3f]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ffe27a]" />
          <div>
            <span className="text-xs font-bold text-white block">
              AI De-Wrinkle &amp; Lighting Suppression
            </span>
            <span className="text-[11px] text-[#6e7e95]">
              Normalizes lighting folds and highlights on fabric for clean flat sublimation
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={deWrinkle}
            onChange={(e) => onToggleDeWrinkle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#253246] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7b6cf2]"></div>
        </label>
      </div>

      {/* Roster Ready: Blank Out Back Player Box */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d131e] border border-[#212c3f]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00e5a8]" />
          <div>
            <span className="text-xs font-bold text-white block">
              Back Roster Ready (Clean Name / Number Box)
            </span>
            <span className="text-[11px] text-[#6e7e95]">
              Blanks player name/number for team printing (Matches Back.jpg template)
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={blankBackNumberBox}
            onChange={(e) => onToggleBlankBackNumberBox && onToggleBlankBackNumberBox(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#253246] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00e5a8]"></div>
        </label>
      </div>

      {/* Ribbed Collar & Trim Accent Color */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d131e] border border-[#212c3f]">
        <div>
          <span className="text-xs font-bold text-white block">Collar &amp; Accent Trim Color</span>
          <span className="text-[11px] text-[#6e7e95]">Crewneck ribbing &amp; cuff stripe ink</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={collarColor}
            onChange={(e) => onChangeCollarColor(e.target.value)}
            className="w-7 h-7 rounded border border-[#2d3a4e] cursor-pointer bg-transparent"
          />
          <span className="font-mono text-xs text-[#ccd9ea]">{collarColor}</span>
        </div>
      </div>

      {/* Main Process Button */}
      <button
        onClick={onGenerateFlat}
        disabled={!canGenerate || isProcessing}
        className="w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#6957ee] via-[#8574ff] to-[#998af8] hover:from-[#7665f5] hover:to-[#a496ff] text-white shadow-lg shadow-indigo-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-[#ffe27a]" />
        <span>
          {isProcessing
            ? 'Processing & Generating 4-Piece Kit...'
            : layoutMode === '4-piece-kit'
            ? 'Generate 4-Piece Sublimation Kit →'
            : 'Create Combined 2D Flat PNG →'}
        </span>
      </button>
    </div>
  );
};
