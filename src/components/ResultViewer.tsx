/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Layers, Grid, Maximize2, Check, Sparkles, Copy, Grid2X2 } from 'lucide-react';

interface ResultViewerProps {
  masterSheetCanvas: HTMLCanvasElement | null;
  combinedCanvas: HTMLCanvasElement | null;
  frontCanvas: HTMLCanvasElement | null;
  backCanvas: HTMLCanvasElement | null;
  leftSleeveCanvas: HTMLCanvasElement | null;
  rightSleeveCanvas: HTMLCanvasElement | null;
  upscaledCanvas: HTMLCanvasElement | null;
  isUpscaling: boolean;
  onRunUpscale: (scale: 2 | 4) => void;
  panelWidth: number;
  panelHeight: number;
  layoutMode: '4-piece-kit' | 'side-by-side';
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  masterSheetCanvas,
  combinedCanvas,
  frontCanvas,
  backCanvas,
  leftSleeveCanvas,
  rightSleeveCanvas,
  upscaledCanvas,
  isUpscaling,
  onRunUpscale,
  panelWidth,
  panelHeight,
  layoutMode,
}) => {
  const [activeTab, setActiveTab] = useState<'front-back' | 'front' | 'back' | '4-piece' | 'sleeves' | 'pattern' | 'upscale'>(
    layoutMode === 'side-by-side' ? 'front-back' : 'front-back'
  );
  const [splitPos, setSplitPos] = useState(50);
  const [tileCount, setTileCount] = useState<2 | 3 | 4>(2);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [packDownloadedNotification, setPackDownloadedNotification] = useState(false);

  // Active display canvas
  const currentDisplayCanvas =
    activeTab === 'front-back'
      ? combinedCanvas || masterSheetCanvas
      : activeTab === '4-piece'
      ? masterSheetCanvas || combinedCanvas
      : activeTab === 'front'
      ? frontCanvas
      : activeTab === 'back'
      ? backCanvas
      : activeTab === 'sleeves'
      ? leftSleeveCanvas
      : masterSheetCanvas || combinedCanvas;

  const downloadCanvas = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadBoth = () => {
    if (!frontCanvas || !backCanvas) return;
    downloadCanvas(frontCanvas, 'front_sublimation_print.png');
    setTimeout(() => {
      downloadCanvas(backCanvas, 'back_sublimation_print.png');
      setPackDownloadedNotification(true);
      setTimeout(() => setPackDownloadedNotification(false), 2500);
    }, 400);
  };

  const handleCopyPng = async () => {
    if (!currentDisplayCanvas) return;
    try {
      currentDisplayCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      });
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  return (
    <div className="bg-[#121824] border border-[#232f42] rounded-xl p-4 flex flex-col gap-4">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#8a7af8]">STEP 04</span>
          <h2 className="text-sm font-bold text-white tracking-wide">
            Processed Sublimation Canvas
          </h2>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-[#0d131f] p-1 rounded-lg border border-[#222f42] flex-wrap">
          <button
            onClick={() => setActiveTab('front-back')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all flex items-center gap-1 ${
              activeTab === 'front-back'
                ? 'bg-[#253347] text-[#00e5a8] shadow-sm font-bold border border-[#00e5a8]/30'
                : 'text-[#8191a8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Front &amp; Back</span>
          </button>

          <button
            onClick={() => setActiveTab('front')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all flex items-center gap-1 ${
              activeTab === 'front'
                ? 'bg-[#253347] text-[#00f0ff] shadow-sm font-bold border border-[#00f0ff]/30'
                : 'text-[#8191a8] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00f0ff]"></span>
            <span>Front Body</span>
          </button>

          <button
            onClick={() => setActiveTab('back')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all flex items-center gap-1 ${
              activeTab === 'back'
                ? 'bg-[#253347] text-[#ff9f43] shadow-sm font-bold border border-[#ff9f43]/30'
                : 'text-[#8191a8] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff9f43]"></span>
            <span>Back Body</span>
          </button>

          <button
            onClick={() => setActiveTab('4-piece')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all flex items-center gap-1 ${
              activeTab === '4-piece'
                ? 'bg-[#253347] text-white shadow-sm font-bold border border-white/20'
                : 'text-[#8191a8] hover:text-white'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5 text-[#ffe27a]" />
            <span>4-Piece Kit</span>
          </button>

          <button
            onClick={() => setActiveTab('pattern')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all flex items-center gap-1 ${
              activeTab === 'pattern'
                ? 'bg-[#253347] text-white shadow-sm font-bold'
                : 'text-[#8191a8] hover:text-white'
            }`}
          >
            <Grid className="w-3 h-3 text-[#ffe27a]" />
            <span>Tile Repeat</span>
          </button>

          <button
            onClick={() => setActiveTab('upscale')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all flex items-center gap-1 ${
              activeTab === 'upscale'
                ? 'bg-[#253347] text-white shadow-sm font-bold'
                : 'text-[#8191a8] hover:text-white'
            }`}
          >
            <Maximize2 className="w-3 h-3 text-[#00f0ff]" />
            <span>HD Upscale</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Display Area */}
      <div className="relative min-h-[460px] max-h-[72vh] rounded-xl border border-[#232f42] bg-[#0c1017] [background-image:linear-gradient(45deg,#151c28_25%,transparent_25%),linear-gradient(-45deg,#151c28_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#151c28_75%),linear-gradient(-45deg,transparent_75%,#151c28_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0] flex items-center justify-center p-3 overflow-hidden">
        {!currentDisplayCanvas ? (
          <div className="text-center p-8 text-[#5d6f86]">
            <div className="w-12 h-12 rounded-xl bg-[#192231] mx-auto flex items-center justify-center text-[#7b6cf2] mb-3">
              ✧
            </div>
            <strong className="text-sm font-bold text-[#b4c3d8] block">
              Waiting for panel selection
            </strong>
            <p className="text-xs text-[#718299] max-w-sm mt-1">
              Click "Generate 4-Piece Sublimation Kit" in Step 03 to create the exact full cut-and-sew template matching your reference image!
            </p>
          </div>
        ) : activeTab === 'front-back' ? (
          <div className="relative max-h-full max-w-full flex items-center justify-center">
            <img
              src={(combinedCanvas || masterSheetCanvas)!.toDataURL('image/png')}
              alt="Front and Back Sublimation Master Sheet"
              className="max-h-[66vh] max-w-full object-contain rounded drop-shadow-2xl border border-[#293240]"
            />
            <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 bg-black/85 text-[#00e5a8] rounded border border-[#00e5a8]/30">
              Front &amp; Back Roll Sheet · {panelWidth * 2} × {panelHeight} px
            </span>
          </div>
        ) : activeTab === '4-piece' ? (
          <div className="relative max-h-full max-w-full flex items-center justify-center">
            <img
              src={currentDisplayCanvas!.toDataURL('image/png')}
              alt="4-Piece Sublimation Master Print Sheet"
              className="max-h-[66vh] max-w-full object-contain rounded drop-shadow-2xl border border-[#293240]"
            />
            <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 bg-black/80 text-[#00e5a8] rounded border border-[#00e5a8]/30">
              4-Piece Cut-and-Sew Kit (Top: Sleeves · Bottom: Front &amp; Back)
            </span>
          </div>
        ) : activeTab === 'front' ? (
          frontCanvas && (
            <div className="relative max-h-full max-w-full flex items-center justify-center">
              <img
                src={frontCanvas.toDataURL('image/png')}
                alt="Front Flat Body Panel"
                className="max-h-[66vh] max-w-full object-contain rounded drop-shadow-xl border border-[#293240]"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 bg-black/85 text-[#00f0ff] rounded border border-[#00f0ff]/30">
                Front Flat Print File · {frontCanvas.width} × {frontCanvas.height} px
              </span>
            </div>
          )
        ) : activeTab === 'back' ? (
          backCanvas && (
            <div className="relative max-h-full max-w-full flex items-center justify-center">
              <img
                src={backCanvas.toDataURL('image/png')}
                alt="Back Flat Body Panel"
                className="max-h-[66vh] max-w-full object-contain rounded drop-shadow-xl border border-[#293240]"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 bg-black/85 text-[#ff9f43] rounded border border-[#ff9f43]/30">
                Back Flat Print File (Roster Ready Blank Box) · {backCanvas.width} × {backCanvas.height} px
              </span>
            </div>
          )
        ) : activeTab === 'sleeves' ? (
          <div className="flex items-center gap-4 max-h-[66vh] max-w-full overflow-hidden p-2">
            {leftSleeveCanvas && (
              <div className="text-center flex flex-col items-center">
                <span className="text-[11px] font-bold text-[#8ba0bd] mb-1">LEFT SLEEVE</span>
                <img
                  src={leftSleeveCanvas.toDataURL('image/png')}
                  alt="Left Sleeve"
                  className="max-h-[55vh] object-contain drop-shadow-lg"
                />
              </div>
            )}
            {rightSleeveCanvas && (
              <div className="text-center flex flex-col items-center">
                <span className="text-[11px] font-bold text-[#8ba0bd] mb-1">RIGHT SLEEVE</span>
                <img
                  src={rightSleeveCanvas.toDataURL('image/png')}
                  alt="Right Sleeve"
                  className="max-h-[55vh] object-contain drop-shadow-lg"
                />
              </div>
            )}
          </div>
        ) : activeTab === 'pattern' ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2 bg-[#121926] px-3 py-1 rounded-lg border border-[#232f42] text-xs text-[#8c9cb3] mb-1">
              <span>Repeat grid:</span>
              <button
                onClick={() => setTileCount(2)}
                className={`px-2 py-0.5 rounded ${tileCount === 2 ? 'bg-[#7b6cf2] text-white font-bold' : 'hover:bg-[#202b3d]'}`}
              >
                2 × 2
              </button>
              <button
                onClick={() => setTileCount(3)}
                className={`px-2 py-0.5 rounded ${tileCount === 3 ? 'bg-[#7b6cf2] text-white font-bold' : 'hover:bg-[#202b3d]'}`}
              >
                3 × 3
              </button>
              <button
                onClick={() => setTileCount(4)}
                className={`px-2 py-0.5 rounded ${tileCount === 4 ? 'bg-[#7b6cf2] text-white font-bold' : 'hover:bg-[#202b3d]'}`}
              >
                4 × 4
              </button>
            </div>
            {frontCanvas && (
              <div
                className="w-full max-w-[620px] h-[360px] rounded-lg border border-[#232f42] bg-repeat shadow-inner"
                style={{
                  backgroundImage: `url(${frontCanvas.toDataURL('image/png')})`,
                  backgroundSize: `${100 / tileCount}% auto`,
                }}
              />
            )}
            <span className="text-[11px] text-[#6e7e95]">
              Simulates infinite fabric pattern repeat across full sublimation roll
            </span>
          </div>
        ) : (
          /* HD Upscaler */
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {isUpscaling ? (
              <div className="text-center p-6 text-[#00f0ff] flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold tracking-wide">
                  AI Super-Resolution Engine Enhancing Details...
                </span>
              </div>
            ) : upscaledCanvas ? (
              <div className="relative max-h-full max-w-full overflow-hidden select-none flex items-center justify-center">
                <img
                  src={(masterSheetCanvas || combinedCanvas)!.toDataURL('image/png')}
                  alt="Original"
                  className="max-h-[58vh] max-w-full object-contain pointer-events-none"
                />
                <div
                  className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
                  style={{
                    clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`,
                  }}
                >
                  <img
                    src={upscaledCanvas.toDataURL('image/png')}
                    alt="Upscaled 4x"
                    className="max-h-[58vh] max-w-full object-contain"
                  />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-[#00f0ff] shadow-lg shadow-cyan-500/50 cursor-ew-resize z-20"
                  style={{ left: `${splitPos}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#00f0ff] text-[#07111c] font-black text-[10px] flex items-center justify-center -translate-x-[11px] translate-y-[180px] shadow-md">
                    ⇄
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPos}
                  onChange={(e) => setSplitPos(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
                />
              </div>
            ) : (
              <div className="text-center p-6 text-[#7d8fa7] flex flex-col items-center gap-3">
                <Maximize2 className="w-10 h-10 text-[#00f0ff] opacity-60" />
                <p className="text-xs">
                  Upscale this sublimation kit to 2x or 4x ultra high-definition for industrial 300 DPI printers.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onRunUpscale(2)}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1b2637] hover:bg-[#25354d] text-white border border-[#2b3c54]"
                  >
                    Upscale 2x HD
                  </button>
                  <button
                    onClick={() => onRunUpscale(4)}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-[#00f0ff] to-[#00a6ff] text-[#05111c] shadow-md shadow-cyan-950/40"
                  >
                    Upscale 4x Ultra Print (300 DPI)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info bar & Specs */}
      {currentDisplayCanvas && (
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#8292aa] pt-1">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>FRONT: {panelWidth} × {panelHeight} px</span>
            <span>·</span>
            <span>BACK: {panelWidth} × {panelHeight} px</span>
            <span>·</span>
            <span className="text-[#00e5a8]">
              SHEET: {currentDisplayCanvas.width} × {currentDisplayCanvas.height} px
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyPng}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#162130] hover:bg-[#202d41] text-[#9cb0cc] border border-[#26374d]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedNotification ? 'Copied!' : 'Copy PNG'}</span>
            </button>

            {frontCanvas && backCanvas && (
              <button
                onClick={handleDownloadBoth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#6e5cf2] to-[#8a7af8] hover:from-[#7b6af5] hover:to-[#9a8bf8] text-white transition-all shadow-md shadow-indigo-950/40"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {packDownloadedNotification ? '✓ Both Files Downloaded!' : 'Download Front + Back Pack (2 Files)'}
                </span>
              </button>
            )}

            <button
              onClick={() =>
                downloadCanvas(
                  activeTab === 'front'
                    ? frontCanvas
                    : activeTab === 'back'
                    ? backCanvas
                    : activeTab === 'sleeves'
                    ? leftSleeveCanvas
                    : upscaledCanvas && activeTab === 'upscale'
                    ? upscaledCanvas
                    : combinedCanvas || masterSheetCanvas,
                  activeTab === 'front'
                    ? 'front_sublimation_art.png'
                    : activeTab === 'back'
                    ? 'back_sublimation_art.png'
                    : activeTab === 'front-back'
                    ? 'front_and_back_sublimation_roll.png'
                    : `sublimation_${activeTab}.png`
                )
              }
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#00e5a8] hover:bg-[#22f2b8] text-[#071b14] transition-colors shadow-md shadow-emerald-950/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeTab === 'front' ? 'Front Body' : activeTab === 'back' ? 'Back Body' : activeTab === 'front-back' ? 'Roll Sheet' : 'PNG'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
