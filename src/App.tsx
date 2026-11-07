/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header, AppMode } from './components/Header';
import { MockupSelector } from './components/MockupSelector';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { BadgeGrabberPanel } from './components/BadgeGrabberPanel';
import { SublimationSettings } from './components/SublimationSettings';
import { ResultViewer } from './components/ResultViewer';
import { AppsScriptModal } from './components/AppsScriptModal';
import { SAMPLE_MOCKUPS, MockupSample } from './utils/sampleMockups';
import {
  Point,
  warpPerspectiveCanvas,
  cropBadgeFromCanvas,
  removeBackgroundChroma,
  upscaleCanvas,
  createCombinedFrontBackCanvas,
  generateSleeveCanvas,
  createFullSublimation4PieceSheet,
  applyRosterBoxBlanking,
} from './utils/imageWarp';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('jersey');
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('grunge-bw-polo');
  const [hasCustomImage, setHasCustomImage] = useState(false);

  // Manual 4-point perspective warp points (in pixels on sourceImage)
  const [frontPoints, setFrontPoints] = useState<Point[]>([]);
  const [backPoints, setBackPoints] = useState<Point[]>([]);

  // Detected badges on mockup
  const [detectedBadges, setDetectedBadges] = useState<any[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [badgeCanvas, setBadgeCanvas] = useState<HTMLCanvasElement | null>(null);
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [isGeneratingSvg, setIsGeneratingSvg] = useState(false);
  const [isDetectingAi, setIsDetectingAi] = useState(false);

  // Sublimation Output Settings
  const [panelWidth, setPanelWidth] = useState(6600);
  const [panelHeight, setPanelHeight] = useState(9000);
  const [deWrinkle, setDeWrinkle] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'4-piece-kit' | 'side-by-side'>('side-by-side');
  const [useSilhouettes, setUseSilhouettes] = useState(false);
  const [blankBackNumberBox, setBlankBackNumberBox] = useState(true);
  const [collarColor, setCollarColor] = useState('#ffffff');
  const [colorPalette, setColorPalette] = useState<{ name: string; hex: string }[]>([]);

  // Result canvases
  const [frontCanvas, setFrontCanvas] = useState<HTMLCanvasElement | null>(null);
  const [backCanvas, setBackCanvas] = useState<HTMLCanvasElement | null>(null);
  const [leftSleeveCanvas, setLeftSleeveCanvas] = useState<HTMLCanvasElement | null>(null);
  const [rightSleeveCanvas, setRightSleeveCanvas] = useState<HTMLCanvasElement | null>(null);
  const [combinedCanvas, setCombinedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [masterSheetCanvas, setMasterSheetCanvas] = useState<HTMLCanvasElement | null>(null);
  const [upscaledCanvas, setUpscaledCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);

  // Modal
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);

  // Canvas ref for extracting image data
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper to load image from data URL and initialize points
  const loadImageData = useCallback((dataUri: string, sample?: MockupSample) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setSourceImage(img);

      // Create off-screen canvas for fast sampling
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
      sourceCanvasRef.current = canvas;

      // Initialize default points from sample or estimate
      const sw = canvas.width;
      const sh = canvas.height;

      if (sample) {
        setSelectedSampleId(sample.id);
        setHasCustomImage(false);

        // Convert percentage to actual pixels
        const fPts = sample.defaultFrontCorners.map(([px, py]) => ({
          x: (px / 100) * sw,
          y: (py / 100) * sh,
        }));
        const bPts = sample.defaultBackCorners.map(([px, py]) => ({
          x: (px / 100) * sw,
          y: (py / 100) * sh,
        }));
        setFrontPoints(fPts);
        setBackPoints(bPts);
        setDetectedBadges(sample.badges);

        if (sample.badges.length > 0) {
          handleSelectBadge(sample.badges[0], canvas);
        }

        if (sample.id === 'grunge-bw-polo') {
          setColorPalette([
            { name: 'Carbon Black', hex: '#111111' },
            { name: 'Pure White', hex: '#ffffff' },
            { name: 'Smoke Grey', hex: '#888888' },
          ]);
          setCollarColor('#ffffff');
          setLayoutMode('side-by-side');
          setPanelWidth(6600);
          setPanelHeight(9000);
          setUseSilhouettes(false);
        } else if (sample.id === 'thunder-cream-raglan') {
          setColorPalette([
            { name: 'Thunder Cream', hex: '#f4f1ea' },
            { name: 'Speed Orange', hex: '#ff7b00' },
            { name: 'Raglan Brown', hex: '#4d2b26' },
            { name: 'Yoke Violet', hex: '#372f52' },
          ]);
          setCollarColor('#ff7b00');
          setLayoutMode('4-piece-kit');
          setPanelWidth(3000);
          setPanelHeight(4000);
          setUseSilhouettes(true);
        } else {
          setColorPalette([
            { name: 'Royale Gold', hex: '#d4af37' },
            { name: 'Metallic Highlight', hex: '#ffe27a' },
            { name: 'Deep Carbon', hex: '#0a0d14' },
            { name: 'Trim Navy', hex: '#162030' },
          ]);
        }

        // If sample has precomputedFrontUrl & precomputedBackUrl, load high-res print files
        if (sample.precomputedFrontUrl && sample.precomputedBackUrl) {
          const fImg = new Image();
          fImg.crossOrigin = 'anonymous';
          fImg.onload = () => {
            const fCan = document.createElement('canvas');
            fCan.width = fImg.naturalWidth || 6600;
            fCan.height = fImg.naturalHeight || 9000;
            const fCtx = fCan.getContext('2d');
            if (fCtx) fCtx.drawImage(fImg, 0, 0);
            setFrontCanvas(fCan);

            const bImg = new Image();
            bImg.crossOrigin = 'anonymous';
            bImg.onload = () => {
              const bCan = document.createElement('canvas');
              bCan.width = bImg.naturalWidth || 6603;
              bCan.height = bImg.naturalHeight || 9004;
              const bCtx = bCan.getContext('2d');
              if (bCtx) bCtx.drawImage(bImg, 0, 0);
              setBackCanvas(bCan);

              // Create combined side-by-side
              const combined = createCombinedFrontBackCanvas(fCan, bCan, 3000, 4000, 50, true);
              setCombinedCanvas(combined);

              // Sleeves
              const sleeveH = Math.round(4000 * 0.44);
              const lSleeve = generateSleeveCanvas(3000, sleeveH, {
                baseColor: '#121212',
                stripeColor: '#ffffff',
                stripeCount: 8,
              });
              const rSleeve = generateSleeveCanvas(3000, sleeveH, {
                baseColor: '#121212',
                stripeColor: '#ffffff',
                stripeCount: 8,
                mirrored: true,
              });
              setLeftSleeveCanvas(lSleeve);
              setRightSleeveCanvas(rSleeve);

              const master = createFullSublimation4PieceSheet(fCan, bCan, lSleeve, rSleeve, {
                collarColor: '#ffffff',
                useSilhouettes: false,
                includeLabels: false,
              });
              setMasterSheetCanvas(master);
            };
            bImg.src = sample.precomputedBackUrl!;
          };
          fImg.src = sample.precomputedFrontUrl;
        }
      } else {
        setHasCustomImage(true);
        // Default estimate for front and back side-by-side
        setFrontPoints([
          { x: sw * 0.1, y: sh * 0.15 },
          { x: sw * 0.45, y: sh * 0.15 },
          { x: sw * 0.42, y: sh * 0.85 },
          { x: sw * 0.12, y: sh * 0.85 },
        ]);
        setBackPoints([
          { x: sw * 0.55, y: sh * 0.15 },
          { x: sw * 0.9, y: sh * 0.15 },
          { x: sw * 0.88, y: sh * 0.85 },
          { x: sw * 0.58, y: sh * 0.85 },
        ]);
        // Trigger auto AI detection for badges
        autoDetectMockupElements(img);
      }
    };
    img.src = dataUri;
  }, []);

  // Initialize with the featured Grunge B&W Polo mockup on mount
  useEffect(() => {
    const defaultSample = SAMPLE_MOCKUPS[0];
    loadImageData(defaultSample.imageUrl || defaultSample.svgDataUri || '', defaultSample);
  }, [loadImageData]);

  // Handle badge selection and crop
  const handleSelectBadge = (badge: any, customCanvas?: HTMLCanvasElement) => {
    setSelectedBadge(badge);
    setGeneratedSvg(null);

    const canvas = customCanvas || sourceCanvasRef.current;
    if (!canvas) return;

    // Crop badge
    const cropped = cropBadgeFromCanvas(canvas, badge.box, 0.04);
    // Isolate with default chroma transparency
    const transparent = removeBackgroundChroma(cropped, 35);
    setBadgeCanvas(transparent);
  };

  // Re-run transparency on slider change
  const handleProcessTransparency = (tolerance: number) => {
    if (!sourceCanvasRef.current || !selectedBadge) return;
    const cropped = cropBadgeFromCanvas(sourceCanvasRef.current, selectedBadge.box, 0.04);
    const transparent = removeBackgroundChroma(cropped, tolerance);
    setBadgeCanvas(transparent);
  };

  // AI Auto-Detect Badges & Panels using Gemini Server API
  const autoDetectMockupElements = async (imgParam?: HTMLImageElement) => {
    const img = imgParam || sourceImage;
    if (!img) return;

    setIsDetectingAi(true);
    try {
      const canvas = sourceCanvasRef.current || document.createElement('canvas');
      const base64 = canvas.toDataURL('image/jpeg', 0.85);

      const res = await fetch('/api/detect-badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        if (data.badges && data.badges.length > 0) {
          setDetectedBadges(data.badges);
          handleSelectBadge(data.badges[0]);
        }

        const sw = canvas.width;
        const sh = canvas.height;

        if (data.frontPanelCorners && data.frontPanelCorners.length === 4) {
          setFrontPoints(
            data.frontPanelCorners.map(([px, py]: [number, number]) => ({
              x: (px / 100) * sw,
              y: (py / 100) * sh,
            }))
          );
        }

        if (data.backPanelCorners && data.backPanelCorners.length === 4) {
          setBackPoints(
            data.backPanelCorners.map(([px, py]: [number, number]) => ({
              x: (px / 100) * sw,
              y: (py / 100) * sh,
            }))
          );
        }

        if (data.colorPalette) {
          setColorPalette(data.colorPalette);
        }
      }
    } catch (err) {
      console.error('AI Auto-detect failed:', err);
    } finally {
      setIsDetectingAi(false);
    }
  };

  // AI Generate Vector SVG from cropped badge
  const handleGenerateSvg = async () => {
    if (!badgeCanvas || !selectedBadge) return;

    setIsGeneratingSvg(true);
    try {
      const croppedBase64 = badgeCanvas.toDataURL('image/png');
      const res = await fetch('/api/generate-vector-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          croppedBase64,
          badgeName: selectedBadge.label,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.svgCode) {
        setGeneratedSvg(json.data.svgCode);
      }
    } catch (err) {
      console.error('Vectorize SVG error:', err);
    } finally {
      setIsGeneratingSvg(false);
    }
  };

  // Perform 4-point perspective warp and generate FULL 4-piece sublimation kit (Matching user image!)
  const handleGenerateFlatSublimation = () => {
    const canvas = sourceCanvasRef.current;
    if (!canvas || frontPoints.length !== 4 || backPoints.length !== 4) return;

    setIsProcessing(true);
    setTimeout(() => {
      try {
        // 1. Warp FRONT body panel
        const frontFlat = warpPerspectiveCanvas(canvas, frontPoints, panelWidth, panelHeight, {
          deWrinkle,
          smoothEdges: true,
        });

        // 2. Warp BACK body panel
        const backFlat = warpPerspectiveCanvas(canvas, backPoints, panelWidth, panelHeight, {
          deWrinkle,
          smoothEdges: true,
        });

        // 3. If blankBackNumberBox is true, blank out the player name & number box for team roster
        if (blankBackNumberBox) {
          applyRosterBoxBlanking(backFlat, panelWidth, panelHeight);
        }

        // 4. Generate matching Left & Right Sleeves with Bell Cap and Cuff Speed Stripes
        const sleeveH = Math.round(panelHeight * 0.44);
        const lSleeve = generateSleeveCanvas(panelWidth, sleeveH, {
          baseColor: collarColor === '#ffffff' ? '#121212' : '#4d2b26',
          stripeColor: collarColor,
          stripeCount: 11,
        });

        const rSleeve = generateSleeveCanvas(panelWidth, sleeveH, {
          baseColor: collarColor === '#ffffff' ? '#121212' : '#4d2b26',
          stripeColor: collarColor,
          stripeCount: 11,
          mirrored: true,
        });

        // 4. Generate the FULL 4-PIECE MASTER SHEET (Matching user's exact uploaded image!)
        const masterSheet = createFullSublimation4PieceSheet(
          frontFlat,
          backFlat,
          lSleeve,
          rSleeve,
          {
            collarColor,
            useSilhouettes,
            includeLabels: false,
          }
        );

        // 5. Generate legacy side-by-side for 2-piece toggle
        const combined = createCombinedFrontBackCanvas(
          frontFlat,
          backFlat,
          panelWidth,
          panelHeight,
          40,
          true
        );

        setFrontCanvas(frontFlat);
        setBackCanvas(backFlat);
        setLeftSleeveCanvas(lSleeve);
        setRightSleeveCanvas(rSleeve);
        setMasterSheetCanvas(masterSheet);
        setCombinedCanvas(combined);
        setUpscaledCanvas(null);
      } catch (err) {
        console.error('Warp error:', err);
        alert('Failed to warp panels. Please ensure corners are inside image.');
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // 2x / 4x Super Resolution Upscale
  const handleRunUpscale = (scale: 2 | 4) => {
    const target = masterSheetCanvas || combinedCanvas;
    if (!target) return;
    setIsUpscaling(true);
    setTimeout(() => {
      try {
        const upscaled = upscaleCanvas(target, scale, true);
        setUpscaledCanvas(upscaled);
      } catch (err) {
        console.error('Upscale error:', err);
      } finally {
        setIsUpscaling(false);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#090d15] text-[#edf2fa] flex flex-col font-sans selection:bg-[#7b6cf2] selection:text-white">
      {/* Top Navigation */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input, Mockup Selection, Interactive Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Mockup Selector */}
          <MockupSelector
            onImageSelected={(uri, sample) => loadImageData(uri, sample)}
            selectedSampleId={selectedSampleId}
            hasCustomImage={hasCustomImage}
            imageDimensions={
              sourceImage
                ? {
                    width: sourceImage.naturalWidth || sourceImage.width,
                    height: sourceImage.naturalHeight || sourceImage.height,
                  }
                : undefined
            }
          />

          {/* Interactive Canvas with 4 Corner handles & Loupe */}
          <InteractiveCanvas
            sourceImage={sourceImage}
            mode={currentMode}
            frontPoints={frontPoints}
            backPoints={backPoints}
            onPointsChange={(f, b) => {
              setFrontPoints(f);
              setBackPoints(b);
            }}
            detectedBadges={detectedBadges}
            selectedBadgeId={selectedBadge?.id || null}
            onSelectBadge={handleSelectBadge}
            onAutoDetectCorners={() => autoDetectMockupElements()}
            isDetectingAi={isDetectingAi}
          />
        </div>

        {/* RIGHT COLUMN: Mode-Specific Tool Panel & Result Canvas (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Mode Switcher Panels */}
          {currentMode === 'badge' ? (
            <BadgeGrabberPanel
              badges={detectedBadges}
              selectedBadge={selectedBadge}
              onSelectBadge={handleSelectBadge}
              badgeCanvas={badgeCanvas}
              onProcessTransparency={handleProcessTransparency}
              onGenerateSvg={handleGenerateSvg}
              isGeneratingSvg={isGeneratingSvg}
              generatedSvg={generatedSvg}
              onDetectBadgesAi={() => autoDetectMockupElements()}
              isDetectingAi={isDetectingAi}
            />
          ) : (
            <SublimationSettings
              panelWidth={panelWidth}
              panelHeight={panelHeight}
              onDimensionsChange={(w, h) => {
                setPanelWidth(w);
                setPanelHeight(h);
              }}
              deWrinkle={deWrinkle}
              onToggleDeWrinkle={setDeWrinkle}
              layoutMode={layoutMode}
              onChangeLayoutMode={setLayoutMode}
              useSilhouettes={useSilhouettes}
              onToggleSilhouettes={setUseSilhouettes}
              blankBackNumberBox={blankBackNumberBox}
              onToggleBlankBackNumberBox={setBlankBackNumberBox}
              collarColor={collarColor}
              onChangeCollarColor={setCollarColor}
              colorPalette={colorPalette}
              isProcessing={isProcessing}
              onGenerateFlat={handleGenerateFlatSublimation}
              canGenerate={frontPoints.length === 4 && backPoints.length === 4}
            />
          )}

          {/* Result Viewer Canvas */}
          <ResultViewer
            masterSheetCanvas={masterSheetCanvas}
            combinedCanvas={combinedCanvas}
            frontCanvas={frontCanvas}
            backCanvas={backCanvas}
            leftSleeveCanvas={leftSleeveCanvas}
            rightSleeveCanvas={rightSleeveCanvas}
            upscaledCanvas={upscaledCanvas}
            isUpscaling={isUpscaling}
            onRunUpscale={handleRunUpscale}
            panelWidth={panelWidth}
            panelHeight={panelHeight}
            layoutMode={layoutMode}
          />
        </div>
      </main>

      {/* Google Apps Script Modal */}
      <AppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
      />
    </div>
  );
}
