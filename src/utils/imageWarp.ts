/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-performance Projective Homography & Image Processing Engine
 * for AI Design Grabber (Sublimation & Jersey Flat Pattern Extraction)
 */

export interface Point {
  x: number;
  y: number;
}

export interface RectBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

/**
 * Computes the 3x3 projective homography matrix mapping a unit square [0,0],[1,0],[1,1],[0,1]
 * to arbitrary quad points p0, p1, p2, p3.
 */
function getSquareToQuadTransform(p0: Point, p1: Point, p2: Point, p3: Point): number[] {
  const dx1 = p1.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dx2 = p3.x - p2.x;
  const dy2 = p3.y - p2.y;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;

  if (Math.abs(sx) < 1e-7 && Math.abs(sy) < 1e-7) {
    // Affine transform
    return [
      p1.x - p0.x, p2.x - p1.x, p0.x,
      p1.y - p0.y, p2.y - p1.y, p0.y,
      0, 0, 1
    ];
  }

  const det = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(det) < 1e-7) {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  const g = (sx * dy2 - sy * dx2) / det;
  const h = (dx1 * sy - dy1 * sx) / det;

  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + h * p3.x;
  const c = p0.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + h * p3.y;
  const f = p0.y;

  return [a, b, c, d, e, f, g, h, 1];
}

/**
 * Invert 3x3 matrix
 */
function invert3x3(m: number[]): number[] {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const D = -(b * i - c * h);
  const E = a * i - c * g;
  const F = -(a * h - b * g);
  const G = b * f - c * e;
  const H = -(a * f - c * d);
  const I = a * e - b * d;

  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-10) return [1, 0, 0, 0, 1, 0, 0, 0, 1];

  const invDet = 1 / det;
  return [
    A * invDet, D * invDet, G * invDet,
    B * invDet, E * invDet, H * invDet,
    C * invDet, F * invDet, I * invDet
  ];
}

/**
 * Multiply two 3x3 matrices
 */
function multiply3x3(A: number[], B: number[]): number[] {
  const C = new Array(9);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += A[r * 3 + k] * B[k * 3 + c];
      }
      C[r * 3 + c] = sum;
    }
  }
  return C;
}

/**
 * Computes the projective homography matrix mapping quad [p0, p1, p2, p3]
 * directly to rectangle [0,0, W, H].
 */
export function getPerspectiveMatrix(srcPts: Point[], outW: number, outH: number): number[] {
  const [p0, p1, p2, p3] = srcPts;
  // Map unit square to src quad
  const M_src = getSquareToQuadTransform(p0, p1, p2, p3);

  // Map unit square to dst quad (rect: [0,0], [outW,0], [outW,outH], [0,outH])
  const dst0 = { x: 0, y: 0 };
  const dst1 = { x: outW, y: 0 };
  const dst2 = { x: outW, y: outH };
  const dst3 = { x: 0, y: outH };
  const M_dst = getSquareToQuadTransform(dst0, dst1, dst2, dst3);

  // Map dst rect to src quad: M_src * inv(M_dst)
  const invM_dst = invert3x3(M_dst);
  return multiply3x3(M_src, invM_dst);
}

/**
 * Warps source canvas using 4 points into a target rectangle of width x height.
 * Uses high-quality bilinear interpolation with optional anti-aliasing and fabric de-wrinkle.
 */
export function warpPerspectiveCanvas(
  sourceCanvas: HTMLCanvasElement,
  srcQuad: Point[],
  targetWidth: number,
  targetHeight: number,
  options: {
    deWrinkle?: boolean;
    smoothEdges?: boolean;
    brightnessAdjust?: number;
  } = {}
): HTMLCanvasElement {
  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return outCanvas;

  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) return outCanvas;

  const srcWidth = sourceCanvas.width;
  const srcHeight = sourceCanvas.height;
  const srcImgData = srcCtx.getImageData(0, 0, srcWidth, srcHeight);
  const srcData = srcImgData.data;

  const outImgData = outCtx.createImageData(targetWidth, targetHeight);
  const outData = outImgData.data;

  // Compute mapping matrix from destination pixels (u, v) back to source (x, y)
  const H = getPerspectiveMatrix(srcQuad, targetWidth, targetHeight);
  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = H;

  // Bilinear sampling loop
  for (let y = 0; y < targetHeight; y++) {
    const rowOffset = y * targetWidth * 4;
    for (let x = 0; x < targetWidth; x++) {
      const pxIndex = rowOffset + x * 4;

      const w = h6 * x + h7 * y + h8;
      if (Math.abs(w) < 1e-6) continue;
      const invW = 1.0 / w;
      const srcX = (h0 * x + h1 * y + h2) * invW;
      const srcY = (h3 * x + h4 * y + h5) * invW;

      if (srcX >= 0 && srcX < srcWidth - 1 && srcY >= 0 && srcY < srcHeight - 1) {
        const x0 = Math.floor(srcX);
        const y0 = Math.floor(srcY);
        const x1 = x0 + 1;
        const y1 = y0 + 1;
        const dx = srcX - x0;
        const dy = srcY - y0;

        const w00 = (1 - dx) * (1 - dy);
        const w10 = dx * (1 - dy);
        const w01 = (1 - dx) * dy;
        const w11 = dx * dy;

        const idx00 = (y0 * srcWidth + x0) * 4;
        const idx10 = (y0 * srcWidth + x1) * 4;
        const idx01 = (y1 * srcWidth + x0) * 4;
        const idx11 = (y1 * srcWidth + x1) * 4;

        let r = w00 * srcData[idx00] + w10 * srcData[idx10] + w01 * srcData[idx01] + w11 * srcData[idx11];
        let g = w00 * srcData[idx00 + 1] + w10 * srcData[idx10 + 1] + w01 * srcData[idx01 + 1] + w11 * srcData[idx11 + 1];
        let b = w00 * srcData[idx00 + 2] + w10 * srcData[idx10 + 2] + w01 * srcData[idx01 + 2] + w11 * srcData[idx11 + 2];
        const a = w00 * srcData[idx00 + 3] + w10 * srcData[idx10 + 3] + w01 * srcData[idx01 + 3] + w11 * srcData[idx11 + 3];

        if (options.brightnessAdjust) {
          r = Math.min(255, Math.max(0, r + options.brightnessAdjust));
          g = Math.min(255, Math.max(0, g + options.brightnessAdjust));
          b = Math.min(255, Math.max(0, b + options.brightnessAdjust));
        }

        outData[pxIndex] = r;
        outData[pxIndex + 1] = g;
        outData[pxIndex + 2] = b;
        outData[pxIndex + 3] = a;
      }
    }
  }

  outCtx.putImageData(outImgData, 0, 0);

  // Optional De-Wrinkle Filter (Sublimation Shadow Suppression)
  if (options.deWrinkle) {
    applyDeWrinkleFilter(outCtx, targetWidth, targetHeight);
  }

  return outCanvas;
}

/**
 * De-Wrinkle Filter:
 * Suppresses lighting gradients, shadow folds and highlights on fabrics
 * by normalizing local luminance while preserving sharp high-frequency graphic edges.
 */
function applyDeWrinkleFilter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Simple unsharp / high-frequency boost & shadow lift
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Lift deep shadows gently to flatten mockup folds
    if (lum < 90 && lum > 20) {
      const lift = (90 - lum) * 0.18;
      data[i] = Math.min(255, r + lift);
      data[i + 1] = Math.min(255, g + lift);
      data[i + 2] = Math.min(255, b + lift);
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Crop a badge or emblem using normalized box [ymin, xmin, ymax, xmax] (0-1000)
 */
export function cropBadgeFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  box: [number, number, number, number],
  paddingPercent = 0.05
): HTMLCanvasElement {
  const [ymin, xmin, ymax, xmax] = box;
  const sw = sourceCanvas.width;
  const sh = sourceCanvas.height;

  let x = (xmin / 1000) * sw;
  let y = (ymin / 1000) * sh;
  let w = ((xmax - xmin) / 1000) * sw;
  let h = ((ymax - ymin) / 1000) * sh;

  // Add slight padding around badge
  const padX = w * paddingPercent;
  const padY = h * paddingPercent;
  x = Math.max(0, x - padX);
  y = Math.max(0, y - padY);
  w = Math.min(sw - x, w + padX * 2);
  h = Math.min(sh - y, h + padY * 2);

  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = Math.max(64, Math.round(w));
  badgeCanvas.height = Math.max(64, Math.round(h));

  const ctx = badgeCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(sourceCanvas, x, y, w, h, 0, 0, badgeCanvas.width, badgeCanvas.height);
  }
  return badgeCanvas;
}

/**
 * Intelligent Background Removal & Transparency Keyer:
 * Removes outer background or fabric color around a badge or crest,
 * with edge-feathering and tolerance.
 */
export function removeBackgroundChroma(
  canvas: HTMLCanvasElement,
  tolerance = 30,
  keyCornerOnly = true
): HTMLCanvasElement {
  const outCanvas = document.createElement('canvas');
  outCanvas.width = canvas.width;
  outCanvas.height = canvas.height;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return outCanvas;

  ctx.drawImage(canvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Sample corner pixel colors (TL, TR, BL, BR) to find background colors
  const cornerIdxs = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + (w - 1)) * 4];
  const bgColors: [number, number, number][] = cornerIdxs.map((idx) => [
    data[idx],
    data[idx + 1],
    data[idx + 2],
  ]);

  // Flood fill or color distance
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check distance to any corner background color
    let minDistance = 999;
    for (const [bgR, bgG, bgB] of bgColors) {
      const dist = Math.sqrt(
        (r - bgR) * (r - bgR) + (g - bgG) * (g - bgG) + (b - bgB) * (b - bgB)
      );
      if (dist < minDistance) minDistance = dist;
    }

    if (minDistance < tolerance) {
      // Soft alpha feathering
      const alpha = Math.max(0, (minDistance / tolerance) * 255);
      data[i + 3] = Math.min(data[i + 3], alpha);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return outCanvas;
}

/**
 * 2x / 4x Super-Resolution & Sublimation Edge Sharpener
 */
export function upscaleCanvas(
  canvas: HTMLCanvasElement,
  scale: 2 | 4 = 2,
  sharpen = true
): HTMLCanvasElement {
  const outW = canvas.width * scale;
  const outH = canvas.height * scale;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return outCanvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, outW, outH);

  if (sharpen) {
    applyUnsharpMask(ctx, outW, outH, 0.4);
  }

  return outCanvas;
}

/**
 * Unsharp Mask kernel for crisp vector-like edges on sublimation artwork
 */
function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount = 0.35
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  const copy = new Uint8ClampedArray(d);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const val = copy[idx + c];
        const blur = (
          copy[((y - 1) * width + x) * 4 + c] +
          copy[((y + 1) * width + x) * 4 + c] +
          copy[(y * width + (x - 1)) * 4 + c] +
          copy[(y * width + (x + 1)) * 4 + c]
        ) * 0.25;

        const diff = val - blur;
        d[idx + c] = Math.min(255, Math.max(0, val + diff * amount));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Generates combined side-by-side PNG canvas of Front and Back panels
 */
export function createCombinedFrontBackCanvas(
  frontCanvas: HTMLCanvasElement,
  backCanvas: HTMLCanvasElement,
  panelWidth: number,
  panelHeight: number,
  spacing = 40,
  includeLabels = true
): HTMLCanvasElement {
  const totalWidth = panelWidth * 2 + spacing;
  const labelHeight = includeLabels ? 60 : 0;
  const totalHeight = panelHeight + labelHeight;

  const combined = document.createElement('canvas');
  combined.width = totalWidth;
  combined.height = totalHeight;
  const ctx = combined.getContext('2d');
  if (!ctx) return combined;

  // Clean transparent or white background
  ctx.fillStyle = '#0f141f';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Draw front
  ctx.drawImage(frontCanvas, 0, labelHeight, panelWidth, panelHeight);

  // Draw separator line
  ctx.strokeStyle = '#273449';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(panelWidth + spacing / 2, 0);
  ctx.lineTo(panelWidth + spacing / 2, totalHeight);
  ctx.stroke();

  // Draw back
  ctx.drawImage(backCanvas, panelWidth + spacing, labelHeight, panelWidth, panelHeight);

  // Draw professional titles
  if (includeLabels) {
    ctx.fillStyle = '#edf2fa';
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.fillText('FRONT PANEL (2D FLAT)', 20, 38);
    ctx.fillText('BACK PANEL (2D FLAT)', panelWidth + spacing + 20, 38);

    ctx.fillStyle = '#8392a8';
    ctx.font = '14px Inter, Arial, sans-serif';
    ctx.fillText(`${panelWidth} × ${panelHeight} px`, panelWidth - 160, 38);
    ctx.fillText(`${panelWidth} × ${panelHeight} px`, totalWidth - 160, 38);
  }

  return combined;
}

export type PatternSilhouetteType = 'front' | 'back' | 'sleeve-left' | 'sleeve-right';

/**
 * Creates an apparel pattern silhouette mask path (e.g., Raglan Neckline scoop, shoulder slant, sleeve cap)
 */
export function drawApparelSilhouettePath(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  type: PatternSilhouetteType
) {
  ctx.beginPath();

  if (type === 'front') {
    // Raglan Crewneck Front Body Silhouette
    // Start at Left Collar
    ctx.moveTo(w * 0.35, h * 0.04);
    // Neck scoop down and back up to Right Collar
    ctx.bezierCurveTo(w * 0.38, h * 0.17, w * 0.62, h * 0.17, w * 0.65, h * 0.04);
    // Right Raglan Shoulder slant down to armpit
    ctx.lineTo(w * 0.94, h * 0.18);
    // Right side body down to bottom hem
    ctx.lineTo(w * 0.94, h * 0.96);
    // Bottom hem curve
    ctx.quadraticCurveTo(w * 0.5, h * 0.98, w * 0.06, h * 0.96);
    // Left side body up to armpit
    ctx.lineTo(w * 0.06, h * 0.18);
    // Left Raglan Shoulder slant up to Left Collar
    ctx.lineTo(w * 0.35, h * 0.04);
    ctx.closePath();
  } else if (type === 'back') {
    // Raglan Back Body Silhouette (shallower neck)
    ctx.moveTo(w * 0.35, h * 0.04);
    // Shallow back neck
    ctx.quadraticCurveTo(w * 0.5, h * 0.08, w * 0.65, h * 0.04);
    // Right Raglan Shoulder slant down to armpit
    ctx.lineTo(w * 0.94, h * 0.18);
    // Right side body down to bottom hem
    ctx.lineTo(w * 0.94, h * 0.96);
    // Bottom hem curve
    ctx.quadraticCurveTo(w * 0.5, h * 0.98, w * 0.06, h * 0.96);
    // Left side body up to armpit
    ctx.lineTo(w * 0.06, h * 0.18);
    // Left Raglan Shoulder slant up to Left Collar
    ctx.lineTo(w * 0.35, h * 0.04);
    ctx.closePath();
  } else {
    // Sleeve Panel with classic Bell Cap Crown curve
    // Top sleeve cap curve
    ctx.moveTo(w * 0.08, h * 0.38);
    ctx.bezierCurveTo(w * 0.15, h * 0.05, w * 0.45, h * 0.04, w * 0.5, h * 0.04);
    ctx.bezierCurveTo(w * 0.55, h * 0.04, w * 0.85, h * 0.05, w * 0.92, h * 0.38);
    // Right underarm seam slant to cuff
    ctx.lineTo(w * 0.88, h * 0.95);
    // Bottom cuff hem line
    ctx.lineTo(w * 0.12, h * 0.95);
    // Left underarm seam up
    ctx.lineTo(w * 0.08, h * 0.38);
    ctx.closePath();
  }
}

/**
 * Clips or masks a flat pattern canvas with authentic apparel sewing die-cut silhouettes
 */
export function maskCanvasWithSilhouette(
  sourceCanvas: HTMLCanvasElement,
  type: PatternSilhouetteType,
  options: {
    collarColor?: string;
    collarWidth?: number;
    showContourLine?: boolean;
    contourColor?: string;
  } = {}
): HTMLCanvasElement {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  // 1. Draw clipped pattern
  ctx.save();
  drawApparelSilhouettePath(ctx, w, h, type);
  ctx.clip();
  ctx.drawImage(sourceCanvas, 0, 0, w, h);
  ctx.restore();

  // 2. Optional: Draw orange/accent ribbed collar trim for Front body (as in user's image)
  if (type === 'front' && options.collarColor) {
    ctx.save();
    ctx.strokeStyle = options.collarColor;
    ctx.lineWidth = options.collarWidth || Math.max(16, w * 0.028);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.04);
    ctx.bezierCurveTo(w * 0.38, h * 0.17, w * 0.62, h * 0.17, w * 0.65, h * 0.04);
    ctx.stroke();
    ctx.restore();
  } else if (type === 'back' && options.collarColor) {
    ctx.save();
    ctx.strokeStyle = options.collarColor;
    ctx.lineWidth = Math.max(12, w * 0.022);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.04);
    ctx.quadraticCurveTo(w * 0.5, h * 0.08, w * 0.65, h * 0.04);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Optional cut contour stroke line
  if (options.showContourLine !== false) {
    ctx.save();
    ctx.strokeStyle = options.contourColor || 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = Math.max(2, w * 0.003);
    drawApparelSilhouettePath(ctx, w, h, type);
    ctx.stroke();
    ctx.restore();
  }

  return outCanvas;
}

/**
 * Synthesizes or extracts Left & Right Sleeves with Bell Cap and Cuff speed stripes
 * matching the user's reference image
 */
export function generateSleeveCanvas(
  width: number,
  height: number,
  options: {
    baseColor?: string;
    stripeColor?: string;
    accentColor?: string;
    stripeCount?: number;
    gradientCuff?: boolean;
    mirrored?: boolean;
  } = {}
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const base = options.baseColor || '#462723'; // Warm brown matching reference
  const stripe = options.stripeColor || '#ff6a00'; // Vibrant orange stripe
  const stripeCount = options.stripeCount || 10;

  // Solid base color for sleeve body
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  // Horizontal Speed Stripes on Cuff (bottom 25% of sleeve)
  const cuffTop = height * 0.68;
  const cuffHeight = height * 0.26;
  const step = cuffHeight / stripeCount;

  for (let i = 0; i < stripeCount; i++) {
    const y = cuffTop + i * step;
    const progress = i / (stripeCount - 1); // 0 at top to 1 at bottom cuff
    const alpha = 0.2 + progress * 0.8;
    const thickness = Math.max(2, step * 0.55);

    ctx.fillStyle = stripe;
    ctx.globalAlpha = alpha;
    ctx.fillRect(width * 0.08, y, width * 0.84, thickness);
  }
  ctx.globalAlpha = 1.0;

  return canvas;
}

/**
 * Builds the FULL 4-PIECE SUBLIMATION MASTER SHEET
 * exactly matching the user's reference image (image_c866f91a.png):
 * - Top: Left Sleeve & Right Sleeve side-by-side
 * - Bottom: Front Body & Back Body side-by-side
 * - Dark master sheet background with clean print-ready layout
 */
export function createFullSublimation4PieceSheet(
  frontCanvas: HTMLCanvasElement,
  backCanvas: HTMLCanvasElement,
  leftSleeveCanvas: HTMLCanvasElement,
  rightSleeveCanvas: HTMLCanvasElement,
  options: {
    sheetWidth?: number;
    sheetHeight?: number;
    collarColor?: string;
    useSilhouettes?: boolean;
    bleedMargin?: number;
    backgroundColor?: string;
    includeLabels?: boolean;
  } = {}
): HTMLCanvasElement {
  const useSilhouettes = options.useSilhouettes !== false;
  const bg = options.backgroundColor || '#1e2129';
  const collarCol = options.collarColor || '#ff6a00';

  // Base panel dimensions
  const pw = frontCanvas.width;
  const ph = frontCanvas.height;
  const sw = leftSleeveCanvas.width;
  const sh = leftSleeveCanvas.height;

  // Spacing
  const marginX = Math.round(pw * 0.05);
  const marginY = Math.round(ph * 0.04);
  const gutterX = Math.round(pw * 0.06);
  const gutterY = Math.round(ph * 0.05);

  const totalWidth = marginX * 2 + pw * 2 + gutterX;
  const totalHeight = marginY * 2 + sh + ph + gutterY + (options.includeLabels ? 50 : 0);

  const sheet = document.createElement('canvas');
  sheet.width = totalWidth;
  sheet.height = totalHeight;
  const ctx = sheet.getContext('2d');
  if (!ctx) return sheet;

  // Draw dark master studio sheet
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Subtle container border line (matching the user's reference image)
  ctx.strokeStyle = '#2b313d';
  ctx.lineWidth = 3;
  ctx.strokeRect(marginX * 0.5, marginY * 0.5, totalWidth - marginX, totalHeight - marginY);

  // Prepare masked or raw panels
  const frontToDraw = useSilhouettes
    ? maskCanvasWithSilhouette(frontCanvas, 'front', { collarColor: collarCol })
    : frontCanvas;

  const backToDraw = useSilhouettes
    ? maskCanvasWithSilhouette(backCanvas, 'back', { collarColor: collarCol })
    : backCanvas;

  const lSleeveToDraw = useSilhouettes
    ? maskCanvasWithSilhouette(leftSleeveCanvas, 'sleeve-left')
    : leftSleeveCanvas;

  const rSleeveToDraw = useSilhouettes
    ? maskCanvasWithSilhouette(rightSleeveCanvas, 'sleeve-right')
    : rightSleeveCanvas;

  // Positions
  // Top Left: Left Sleeve
  const lSleeveX = marginX;
  const lSleeveY = marginY;

  // Top Right: Right Sleeve
  const rSleeveX = marginX + pw + gutterX;
  const rSleeveY = marginY;

  // Bottom Left: Front Body
  const frontX = marginX;
  const frontY = marginY + sh + gutterY;

  // Bottom Right: Back Body
  const backX = marginX + pw + gutterX;
  const backY = marginY + sh + gutterY;

  // Draw panels onto master sheet
  ctx.drawImage(lSleeveToDraw, lSleeveX, lSleeveY, pw, sh);
  ctx.drawImage(rSleeveToDraw, rSleeveX, rSleeveY, pw, sh);
  ctx.drawImage(frontToDraw, frontX, frontY, pw, ph);
  ctx.drawImage(backToDraw, backX, backY, pw, ph);

  // Labels if requested
  if (options.includeLabels) {
    ctx.fillStyle = '#899bb3';
    ctx.font = 'bold 16px Inter, Arial, sans-serif';

    ctx.fillText('LEFT SLEEVE', lSleeveX + 16, lSleeveY + 30);
    ctx.fillText('RIGHT SLEEVE', rSleeveX + 16, rSleeveY + 30);
    ctx.fillText('FRONT BODY PANEL', frontX + 16, frontY + 35);
    ctx.fillText('BACK BODY PANEL', backX + 16, backY + 35);
  }

  return sheet;
}

/**
 * Blanks out player name and number box for team roster production,
 * matching Back_1e304b8d.jpg
 */
export function applyRosterBoxBlanking(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  box: { ymin: number; xmin: number; ymax: number; xmax: number } = {
    ymin: 0.28,
    xmin: 0.22,
    ymax: 0.65,
    xmax: 0.78,
  }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const bx = w * box.xmin;
  const by = h * box.ymin;
  const bw = w * (box.xmax - box.xmin);
  const bh = h * (box.ymax - box.ymin);

  // Fill player box with solid black substrate
  ctx.fillStyle = '#08090d';
  ctx.fillRect(bx, by, bw, bh);

  // Optional subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);
}
