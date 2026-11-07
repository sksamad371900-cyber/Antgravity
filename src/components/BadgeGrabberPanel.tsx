/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Sparkles, Download, Copy, Check, Sliders, RefreshCw, Layers } from 'lucide-react';

interface DetectedBadge {
  id: string;
  label: string;
  type: string;
  box: [number, number, number, number];
  dominantColors?: string[];
}

interface BadgeGrabberPanelProps {
  badges: DetectedBadge[];
  selectedBadge: DetectedBadge | null;
  onSelectBadge: (badge: DetectedBadge) => void;
  badgeCanvas: HTMLCanvasElement | null;
  onProcessTransparency: (tolerance: number) => void;
  onGenerateSvg: () => void;
  isGeneratingSvg: boolean;
  generatedSvg: string | null;
  onDetectBadgesAi: () => void;
  isDetectingAi: boolean;
}

export const BadgeGrabberPanel: React.FC<BadgeGrabberPanelProps> = ({
  badges,
  selectedBadge,
  onSelectBadge,
  badgeCanvas,
  onProcessTransparency,
  onGenerateSvg,
  isGeneratingSvg,
  generatedSvg,
  onDetectBadgesAi,
  isDetectingAi,
}) => {
  const [tolerance, setTolerance] = useState(35);
  const [previewBg, setPreviewBg] = useState<'checker' | 'black' | 'white' | 'darkblue'>('checker');
  const [copiedSvg, setCopiedSvg] = useState(false);

  const handleToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTolerance(val);
    onProcessTransparency(val);
  };

  const handleDownloadBadgePng = () => {
    if (!badgeCanvas) return;
    const link = document.createElement('a');
    link.download = `${selectedBadge ? selectedBadge.label.toLowerCase().replace(/\s+/g, '_') : 'badge'}_transparent.png`;
    link.href = badgeCanvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!generatedSvg) return;
    const blob = new Blob([generatedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${selectedBadge ? selectedBadge.label.toLowerCase().replace(/\s+/g, '_') : 'badge'}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySvg = () => {
    if (!generatedSvg) return;
    navigator.clipboard.writeText(generatedSvg);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  return (
    <div className="bg-[#121824] border border-[#232f42] rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            Badge &amp; Logo Grabber
          </h2>
        </div>
        <button
          onClick={onDetectBadgesAi}
          disabled={isDetectingAi}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#1b2434] hover:bg-[#253248] text-[#00f0ff] border border-[#00f0ff]/30 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isDetectingAi ? 'Scanning Mockup...' : 'Scan All Badges'}</span>
        </button>
      </div>

      {/* Badges list */}
      <div>
        <label className="text-[11px] font-bold text-[#7d8ca3] uppercase tracking-wider block mb-2">
          Detected Badges &amp; Logos ({badges.length})
        </label>
        <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
          {badges.length === 0 ? (
            <p className="text-xs text-[#62738b] p-3 text-center bg-[#0d131d] rounded-lg">
              No badges detected yet. Click "Scan All Badges" to let Gemini detect crests &amp; logos automatically!
            </p>
          ) : (
            badges.map((b) => {
              const isSelected = selectedBadge?.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBadge(b)}
                  className={`flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all border ${
                    isSelected
                      ? 'bg-[#18263a] border-[#00f0ff] text-white shadow-sm'
                      : 'bg-[#0e1420] border-[#222e40] text-[#90a2bb] hover:bg-[#151f2e] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                    <span className="font-semibold truncate max-w-[170px]">{b.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {b.dominantColors?.map((c, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full border border-black/40"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                    <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-[#1c2738] text-[#8697ae]">
                      {b.type}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Badge Preview & Transparency Isolation */}
      <div className="bg-[#0b1018] border border-[#202c3d] rounded-xl p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">
            {selectedBadge ? selectedBadge.label : 'Select a badge to isolate'}
          </span>
          <div className="flex items-center gap-1 bg-[#141b27] p-0.5 rounded-lg border border-[#232f42]">
            <button
              onClick={() => setPreviewBg('checker')}
              className={`px-2 py-0.5 text-[10px] rounded font-medium ${previewBg === 'checker' ? 'bg-[#26354b] text-white' : 'text-[#7d8ca3]'}`}
            >
              Checker
            </button>
            <button
              onClick={() => setPreviewBg('black')}
              className={`px-2 py-0.5 text-[10px] rounded font-medium ${previewBg === 'black' ? 'bg-[#26354b] text-white' : 'text-[#7d8ca3]'}`}
            >
              Black
            </button>
            <button
              onClick={() => setPreviewBg('white')}
              className={`px-2 py-0.5 text-[10px] rounded font-medium ${previewBg === 'white' ? 'bg-[#26354b] text-white' : 'text-[#7d8ca3]'}`}
            >
              White
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div
          className={`h-48 rounded-lg flex items-center justify-center p-3 overflow-hidden border border-[#202c3d] ${
            previewBg === 'checker'
              ? 'bg-[#0d131d] [background-image:linear-gradient(45deg,#17202d_25%,transparent_25%),linear-gradient(-45deg,#17202d_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#17202d_75%),linear-gradient(-45deg,transparent_75%,#17202d_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0]'
              : previewBg === 'black'
              ? 'bg-[#0a0a0c]'
              : 'bg-[#ffffff]'
          }`}
        >
          {badgeCanvas ? (
            <img
              src={badgeCanvas.toDataURL('image/png')}
              alt="Isolated Badge"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          ) : (
            <span className="text-xs text-[#5e7088]">
              Select any badge above to see transparent cutout
            </span>
          )}
        </div>

        {/* Chroma Key / Background Removal Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#8495ad] flex items-center gap-1 font-medium">
              <Sliders className="w-3 h-3" /> Background Chroma Tolerance
            </span>
            <span className="font-mono text-[#00f0ff]">{tolerance}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            value={tolerance}
            onChange={handleToleranceChange}
            className="w-full accent-[#00f0ff] cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleDownloadBadgePng}
            disabled={!badgeCanvas}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-[#00f0ff] hover:bg-[#33f3ff] text-[#071321] transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={onGenerateSvg}
            disabled={!badgeCanvas || isGeneratingSvg}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-[#7b6cf2] hover:bg-[#8e81f7] text-white transition-colors disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingSvg ? 'Tracing Vector...' : 'AI Vectorize SVG'}</span>
          </button>
        </div>

        {/* Vector SVG result if generated */}
        {generatedSvg && (
          <div className="p-3 bg-[#0d1420] border border-[#253347] rounded-lg mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#00e5a8] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Scalable Vector SVG Ready
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySvg}
                  className="flex items-center gap-1 text-[11px] text-[#8ea0b7] hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSvg ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#00e5a8] hover:underline"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .SVG</span>
                </button>
              </div>
            </div>
            <div
              className="w-full h-28 bg-[#070b12] rounded p-2 flex items-center justify-center border border-[#1b2637]"
              dangerouslySetInnerHTML={{ __html: generatedSvg }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
