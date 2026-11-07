/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point } from '../utils/imageWarp';
import { Undo2, RotateCcw, Sparkles, ZoomIn, Crosshair } from 'lucide-react';
import { AppMode } from './Header';

interface DetectedBadge {
  id: string;
  label: string;
  type: string;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  dominantColors?: string[];
}

interface InteractiveCanvasProps {
  sourceImage: HTMLImageElement | null;
  mode: AppMode;
  frontPoints: Point[];
  backPoints: Point[];
  onPointsChange: (front: Point[], back: Point[]) => void;
  detectedBadges: DetectedBadge[];
  selectedBadgeId: string | null;
  onSelectBadge: (badge: DetectedBadge) => void;
  onAutoDetectCorners?: () => void;
  isDetectingAi?: boolean;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  sourceImage,
  mode,
  frontPoints,
  backPoints,
  onPointsChange,
  detectedBadges,
  selectedBadgeId,
  onSelectBadge,
  onAutoDetectCorners,
  isDetectingAi,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging point state
  const [draggingPoint, setDraggingPoint] = useState<{
    panel: 'front' | 'back';
    index: number;
  } | null>(null);

  // Mouse hover state for loupe magnifier
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [showLoupe, setShowLoupe] = useState(true);

  // Current stage for manual clicking: 'front' (needs 4) or 'back' (needs 4)
  const isFrontComplete = frontPoints.length === 4;
  const isBackComplete = backPoints.length === 4;
  const activePanel = !isFrontComplete ? 'front' : 'back';

  // Redraw canvas with source image, guidelines, and interactive points
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

    if (mode === 'jersey' || mode === 'pattern' || mode === 'upscale') {
      // Draw FRONT panel quad (#00e5a8 green)
      drawQuad(ctx, frontPoints, '#00e5a8', 'F', canvas.width);

      // Draw BACK panel quad (#ff9f43 orange)
      drawQuad(ctx, backPoints, '#ff9f43', 'B', canvas.width);
    }

    if (mode === 'badge') {
      // Draw detected badge bounding boxes
      detectedBadges.forEach((badge) => {
        const [ymin, xmin, ymax, xmax] = badge.box;
        const bx = (xmin / 1000) * canvas.width;
        const by = (ymin / 1000) * canvas.height;
        const bw = ((xmax - xmin) / 1000) * canvas.width;
        const bh = ((ymax - ymin) / 1000) * canvas.height;

        const isSelected = selectedBadgeId === badge.id;

        ctx.save();
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.strokeStyle = isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash(isSelected ? [] : [5, 4]);
        ctx.strokeRect(bx, by, bw, bh);

        // Fill highlight if selected
        if (isSelected) {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
          ctx.fillRect(bx, by, bw, bh);
        }

        // Badge pill label
        ctx.fillStyle = isSelected ? '#00f0ff' : '#141c29';
        ctx.fillRect(bx, by - 22, Math.max(80, badge.label.length * 7), 20);

        ctx.fillStyle = isSelected ? '#0a0f18' : '#ffffff';
        ctx.font = 'bold 11px Inter, Arial, sans-serif';
        ctx.fillText(badge.label, bx + 6, by - 8);

        ctx.restore();
      });
    }
  }, [sourceImage, mode, frontPoints, backPoints, detectedBadges, selectedBadgeId]);

  // Helper to draw quad
  function drawQuad(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    prefix: string,
    canvasWidth: number
  ) {
    if (!points.length) return;

    ctx.save();
    ctx.lineWidth = Math.max(3, canvasWidth / 400);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // Connect lines
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    if (points.length === 4) {
      ctx.closePath();
      // semi-transparent fill
      ctx.fillStyle = color === '#00e5a8' ? 'rgba(0, 229, 168, 0.12)' : 'rgba(255, 159, 67, 0.12)';
      ctx.fill();
    }
    ctx.stroke();

    // Corner circles with handles
    const cornerLabels = ['TL', 'TR', 'BR', 'BL'];
    points.forEach((p, idx) => {
      const radius = Math.max(10, canvasWidth / 140);
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text label inside / beside
      ctx.fillStyle = '#080d15';
      ctx.font = `bold ${Math.max(12, canvasWidth / 100)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${prefix}${idx + 1}`, p.x, p.y);

      // Label description
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${cornerLabels[idx]}`, p.x + radius + 4, p.y + 4);
    });

    ctx.restore();
  }

  // Update canvas size whenever sourceImage changes
  useEffect(() => {
    if (sourceImage && canvasRef.current) {
      canvasRef.current.width = sourceImage.naturalWidth || sourceImage.width;
      canvasRef.current.height = sourceImage.naturalHeight || sourceImage.height;
      redraw();
    }
  }, [sourceImage, redraw]);

  // Handle canvas mouse clicks and coordinate transformation
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sourceImage) return;
    const { x, y } = getCanvasCoords(e);

    // 1. Check if clicking on an existing handle to drag it
    const grabRadius = Math.max(20, (canvasRef.current?.width || 1000) / 50);

    for (let i = 0; i < frontPoints.length; i++) {
      const p = frontPoints[i];
      if (Math.hypot(p.x - x, p.y - y) <= grabRadius) {
        setDraggingPoint({ panel: 'front', index: i });
        return;
      }
    }

    for (let i = 0; i < backPoints.length; i++) {
      const p = backPoints[i];
      if (Math.hypot(p.x - x, p.y - y) <= grabRadius) {
        setDraggingPoint({ panel: 'back', index: i });
        return;
      }
    }

    // 2. In Badge mode: check if clicking inside a detected badge box
    if (mode === 'badge') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const normX = (x / canvas.width) * 1000;
      const normY = (y / canvas.height) * 1000;

      const hitBadge = detectedBadges.find((b) => {
        const [ymin, xmin, ymax, xmax] = b.box;
        return normX >= xmin && normX <= xmax && normY >= ymin && normY <= ymax;
      });

      if (hitBadge) {
        onSelectBadge(hitBadge);
        return;
      }
    }

    // 3. Otherwise, add new point for manual corner selection
    if (mode === 'jersey' || mode === 'pattern' || mode === 'upscale') {
      if (frontPoints.length < 4) {
        const updated = [...frontPoints, { x, y }];
        onPointsChange(updated, backPoints);
      } else if (backPoints.length < 4) {
        const updated = [...backPoints, { x, y }];
        onPointsChange(frontPoints, updated);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    setHoverPos({
      x: e.clientX,
      y: e.clientY,
      canvasX: x,
      canvasY: y,
    });

    if (draggingPoint) {
      if (draggingPoint.panel === 'front') {
        const updated = [...frontPoints];
        updated[draggingPoint.index] = { x, y };
        onPointsChange(updated, backPoints);
      } else {
        const updated = [...backPoints];
        updated[draggingPoint.index] = { x, y };
        onPointsChange(frontPoints, updated);
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  // Undo and clear helpers
  const handleUndo = () => {
    if (backPoints.length > 0) {
      onPointsChange(frontPoints, backPoints.slice(0, -1));
    } else if (frontPoints.length > 0) {
      onPointsChange(frontPoints.slice(0, -1), backPoints);
    }
  };

  const handleClearCurrent = () => {
    if (isFrontComplete && backPoints.length > 0) {
      onPointsChange(frontPoints, []);
    } else {
      onPointsChange([], backPoints);
    }
  };

  const handleResetAll = () => {
    onPointsChange([], []);
  };

  return (
    <div className="bg-[#121824] border border-[#232f42] rounded-xl p-4 flex flex-col gap-3">
      {/* Panel header & status tips */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#8a7af8]">STEP 02</span>
          <h2 className="text-sm font-bold text-white tracking-wide">
            {mode === 'badge' ? 'Mark or Click Badges & Crests' : 'Mark Front & Back Perspective Corners'}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onAutoDetectCorners && (
            <button
              onClick={onAutoDetectCorners}
              disabled={isDetectingAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1e2738] hover:bg-[#28364d] text-[#00e5a8] border border-[#00e5a8]/30 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00e5a8]" />
              <span>{isDetectingAi ? 'AI Detecting...' : 'AI Auto-Detect Corners'}</span>
            </button>
          )}

          <button
            onClick={handleUndo}
            disabled={frontPoints.length === 0 && backPoints.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#17202e] hover:bg-[#212c3f] text-[#8fa1b9] disabled:opacity-40"
            title="Undo last point"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleClearCurrent}
            disabled={frontPoints.length === 0 && backPoints.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#17202e] hover:bg-[#212c3f] text-[#8fa1b9] disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={() => setShowLoupe(!showLoupe)}
            className={`p-1.5 rounded-lg text-xs border ${
              showLoupe
                ? 'bg-[#1b2234] border-[#7b6cf2] text-[#9f91ff]'
                : 'bg-[#17202e] border-transparent text-[#6e7f96]'
            }`}
            title="Toggle Magnifier Loupe"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Helper instruction notification */}
      <div className="p-2.5 rounded-lg bg-[#0e1420] border-l-4 border-[#7b6cf2] text-xs text-[#b4c4dc] flex items-center justify-between">
        <div>
          {mode === 'badge' ? (
            <span>
              Click on any highlighted badge box or select from the right panel to isolate with transparent PNG &amp; SVG vector.
            </span>
          ) : !isFrontComplete ? (
            <span>
              <strong className="text-[#00e5a8]">FRONT PANEL:</strong> Click corner{' '}
              <span className="font-mono font-bold underline">
                {frontPoints.length + 1} of 4
              </span>{' '}
              (Top-Left → Top-Right → Bottom-Right → Bottom-Left). You can drag handles anytime.
            </span>
          ) : !isBackComplete ? (
            <span>
              <strong className="text-[#ff9f43]">BACK PANEL:</strong> Click corner{' '}
              <span className="font-mono font-bold underline">
                {backPoints.length + 1} of 4
              </span>{' '}
              (Top-Left → Top-Right → Bottom-Right → Bottom-Left).
            </span>
          ) : (
            <span className="text-[#00e5a8] font-semibold">
              ✓ Both Front (Green) and Back (Orange) panels mapped! Ready to warp into flat 2D PNG.
            </span>
          )}
        </div>

        {/* Counter badges */}
        {mode !== 'badge' && (
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[#00e5a8]/10 text-[#00e5a8] border border-[#00e5a8]/20">
              Front: {frontPoints.length}/4
            </span>
            <span className="px-2 py-0.5 rounded bg-[#ff9f43]/10 text-[#ff9f43] border border-[#ff9f43]/20">
              Back: {backPoints.length}/4
            </span>
          </div>
        )}
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="relative bg-[#080c14] border border-[#212b3c] rounded-lg overflow-hidden flex items-center justify-center min-h-[460px] max-h-[68vh]"
      >
        {!sourceImage ? (
          <div className="text-center p-8 text-[#67778e]">
            <Crosshair className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#8574ff]" />
            <p className="text-sm font-semibold">No mockup loaded</p>
            <p className="text-xs">Upload an image or choose a sample above to begin</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setHoverPos(null)}
            className="max-w-full max-h-[66vh] object-contain cursor-crosshair select-none"
          />
        )}

        {/* Pixel Magnifier Loupe Floating Window */}
        {showLoupe && hoverPos && sourceImage && canvasRef.current && (
          <div
            className="pointer-events-none absolute bottom-4 right-4 z-20 w-36 h-36 rounded-xl border-2 border-[#7b6cf2] bg-[#0c1017] shadow-2xl overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(123, 108, 242, 0.4)',
            }}
          >
            <div className="relative flex-1 overflow-hidden">
              <div
                className="absolute inset-0 bg-no-repeat"
                style={{
                  backgroundImage: `url(${sourceImage.src})`,
                  backgroundSize: `${canvasRef.current.width * 2.5}px ${canvasRef.current.height * 2.5}px`,
                  backgroundPosition: `-${hoverPos.canvasX * 2.5 - 72}px -${hoverPos.canvasY * 2.5 - 72}px`,
                }}
              />
              {/* Loupe crosshair */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border border-[#00f0ff] rounded-full"></div>
                <div className="absolute w-full h-[1px] bg-[#00f0ff]/40"></div>
                <div className="absolute h-full w-[1px] bg-[#00f0ff]/40"></div>
              </div>
            </div>
            <div className="bg-[#121824] px-2 py-1 text-[10px] font-mono text-[#8fa1b9] flex justify-between border-t border-[#232f42]">
              <span>X: {Math.round(hoverPos.canvasX)}</span>
              <span>Y: {Math.round(hoverPos.canvasY)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
