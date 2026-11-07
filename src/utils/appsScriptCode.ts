/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Clean, Debugged & Production-Ready Google Apps Script Templates
 * (Fixing the OpenCV WASM memory bounds & esm.sh CDN CSP sandbox failures in Apps Script)
 */

export const APPS_SCRIPT_FILES = {
  'Code.gs': `/**
 * AI Creative Studio - Google Apps Script Backend
 * Handles routing between Workspace and Design Grabber
 */

function doGet(e) {
  const page = e && e.parameter ? e.parameter.page : '';

  if (page === 'grabber') {
    return HtmlService.createHtmlOutputFromFile('Grabber')
      .setTitle('AI Design Grabber — Front + Back')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('AI Creative Studio & Design Grabber')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getAppConfig() {
  return {
    appName: 'AI Creative Studio & Design Grabber',
    version: '2.0.0',
    backendConfigured: true
  };
}
`,

  'Grabber.html': `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Design Grabber — Front + Back</title>
  <style>
    :root { --bg: #0b1018; --panel: #131a26; --line: #243044; --accent: #7c6dfa; --accent-light: #9d91ff; --text: #f0f4fc; --muted: #8292aa; --green: #00e5a8; --orange: #ff9f43; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    header { padding: 18px 24px; background: var(--panel); border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; }
    h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 20px; margin: 16px auto; max-width: 1200px; }
    .btn { display: inline-flex; align-items: center; gap: 8px; border: 0; border-radius: 8px; padding: 10px 18px; background: var(--accent); color: white; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn:hover { background: var(--accent-light); }
    .btn.secondary { background: #263347; }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    #sourceCanvas { max-width: 100%; border: 1px solid var(--line); border-radius: 8px; background: #070a0f; cursor: crosshair; display: block; margin: 16px auto; }
    #outputCanvas { max-width: 100%; border: 1px solid var(--line); border-radius: 8px; background: #1a2230; display: block; margin: 16px auto; }
    .notice { padding: 12px 16px; border-radius: 8px; background: #1a2436; border-left: 4px solid var(--accent); margin-bottom: 16px; font-size: 13px; line-height: 1.5; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    label { font-size: 12px; color: var(--muted); font-weight: bold; }
    input[type=number] { background: #0d131d; border: 1px solid var(--line); color: #fff; padding: 8px 12px; border-radius: 6px; width: 140px; }
  </style>
</head>
<body>
<header>
  <div>
    <h1>AI Design Grabber — Front + Back (Zero-Dependency Engine)</h1>
    <p style="margin:4px 0 0; color:var(--muted); font-size:12px;">Instant 4-point bilinear perspective homography — No heavy OpenCV CDN crashes in Apps Script</p>
  </div>
  <a href="?page=" style="color:#a5b4fc; text-decoration:none; font-size:13px; font-weight:bold;">← Back to Studio</a>
</header>

<main style="padding: 0 16px;">
  <section class="card">
    <div class="row">
      <label class="btn" style="cursor:pointer;">
        Choose Mockup Image
        <input id="imageFile" type="file" accept="image/png,image/jpeg,image/webp" style="display:none;">
      </label>
      <span id="fileInfo" style="color:var(--muted); font-size:13px;">Upload PNG, JPG or WebP (Front + Back jersey)</span>
    </div>
  </section>

  <section class="card">
    <div class="notice" id="tip">Upload a mockup, then mark 4 points for FRONT (green) and 4 points for BACK (orange): Top-Left → Top-Right → Bottom-Right → Bottom-Left.</div>
    <canvas id="sourceCanvas" hidden></canvas>
    <div class="row" style="margin-top:14px;">
      <button id="undoBtn" class="btn secondary" disabled>Undo Point</button>
      <button id="clearBtn" class="btn secondary" disabled>Clear Panel</button>
      <button id="resetBtn" class="btn secondary" disabled>Reset All</button>
      <button id="flattenBtn" class="btn" disabled>Create Combined 2D Flat PNG →</button>
    </div>
  </section>

  <section class="card">
    <div class="row">
      <div>
        <label>Panel Width (px)</label><br>
        <input id="outW" type="number" value="3000" min="500" max="6000">
      </div>
      <div>
        <label>Panel Height (px)</label><br>
        <input id="outH" type="number" value="4000" min="500" max="6000">
      </div>
    </div>
  </section>

  <section class="card" id="resultCard" style="display:none;">
    <h3 style="margin-top:0;">Combined Sublimation Result (Side-by-Side 2D Flat)</h3>
    <canvas id="outputCanvas"></canvas>
    <div class="row" style="margin-top:16px;">
      <a id="downloadLink" class="btn" href="#" download="design_grabber_sublimation.png">Download Combined PNG</a>
    </div>
  </section>
</main>

<script>
// Pure JavaScript Homography Matrix Engine (No external OpenCV needed)
function solveHomography(p0, p1, p2, p3) {
  var dx1 = p1.x - p2.x, dy1 = p1.y - p2.y;
  var dx2 = p3.x - p2.x, dy2 = p3.y - p2.y;
  var sx = p0.x - p1.x + p2.x - p3.x;
  var sy = p0.y - p1.y + p2.y - p3.y;
  if (Math.abs(sx) < 1e-7 && Math.abs(sy) < 1e-7) {
    return [p1.x - p0.x, p2.x - p1.x, p0.x, p1.y - p0.y, p2.y - p1.y, p0.y, 0, 0, 1];
  }
  var det = dx1 * dy2 - dx2 * dy1;
  var g = (sx * dy2 - sy * dx2) / det;
  var h = (dx1 * sy - dy1 * sx) / det;
  return [
    p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x,
    p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y,
    g, h, 1
  ];
}

function invert3x3(m) {
  var a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5], g = m[6], h = m[7], i = m[8];
  var A = e*i - f*h, B = -(d*i - f*g), C = d*h - e*g;
  var D = -(b*i - c*h), E = a*i - c*g, F = -(a*h - b*g);
  var G = b*f - c*e, H = -(a*f - c*d), I = a*e - b*d;
  var det = a*A + b*B + c*C;
  var inv = 1 / det;
  return [A*inv, D*inv, G*inv, B*inv, E*inv, H*inv, C*inv, F*inv, I*inv];
}

function warpQuadToCanvas(srcCanvas, quad, targetW, targetH) {
  var out = document.createElement('canvas');
  out.width = targetW; out.height = targetH;
  var outCtx = out.getContext('2d');
  var srcCtx = srcCanvas.getContext('2d');
  var srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height).data;
  var outImg = outCtx.createImageData(targetW, targetH);
  var outData = outImg.data;
  var sw = srcCanvas.width, sh = srcCanvas.height;

  var H_src = solveHomography(quad[0], quad[1], quad[2], quad[3]);
  var H_dst = solveHomography({x:0, y:0}, {x:targetW, y:0}, {x:targetW, y:targetH}, {x:0, y:targetH});
  var invDst = invert3x3(H_dst);

  // Multiply H_src * invDst
  var H = new Array(9);
  for (var r=0; r<3; r++) {
    for (var c=0; c<3; c++) {
      var sum = 0;
      for (var k=0; k<3; k++) sum += H_src[r*3 + k] * invDst[k*3 + c];
      H[r*3 + c] = sum;
    }
  }

  for (var y=0; y<targetH; y++) {
    var row = y * targetW * 4;
    for (var x=0; x<targetW; x++) {
      var w = H[6]*x + H[7]*y + H[8];
      if (Math.abs(w) < 1e-6) continue;
      var invW = 1.0 / w;
      var sx = (H[0]*x + H[1]*y + H[2]) * invW;
      var sy = (H[3]*x + H[4]*y + H[5]) * invW;

      if (sx >= 0 && sx < sw - 1 && sy >= 0 && sy < sh - 1) {
        var x0 = Math.floor(sx), y0 = Math.floor(sy);
        var dx = sx - x0, dy = sy - y0;
        var idx00 = (y0*sw + x0)*4, idx10 = (y0*sw + (x0+1))*4;
        var idx01 = ((y0+1)*sw + x0)*4, idx11 = ((y0+1)*sw + (x0+1))*4;

        for (var ch=0; ch<4; ch++) {
          var val = (1-dx)*(1-dy)*srcData[idx00+ch] + dx*(1-dy)*srcData[idx10+ch] + (1-dx)*dy*srcData[idx01+ch] + dx*dy*srcData[idx11+ch];
          outData[row + x*4 + ch] = val;
        }
      }
    }
  }
  outCtx.putImageData(outImg, 0, 0);
  return out;
}

// UI Controller
var fileInput = document.getElementById('imageFile');
var canvas = document.getElementById('sourceCanvas');
var ctx = canvas.getContext('2d');
var frontPoints = [], backPoints = [];
var loadedImg = new Image();

fileInput.onchange = function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function() {
    loadedImg.onload = function() {
      canvas.width = loadedImg.width;
      canvas.height = loadedImg.height;
      canvas.hidden = false;
      frontPoints = []; backPoints = [];
      redraw();
      document.getElementById('tip').textContent = 'FRONT: Click 4 corners (TL → TR → BR → BL)';
    };
    loadedImg.src = reader.result;
  };
  reader.readAsDataURL(file);
};

canvas.onclick = function(e) {
  var rect = canvas.getBoundingClientRect();
  var x = (e.clientX - rect.left) * canvas.width / rect.width;
  var y = (e.clientY - rect.top) * canvas.height / rect.height;

  if (frontPoints.length < 4) {
    frontPoints.push({x: x, y: y});
  } else if (backPoints.length < 4) {
    backPoints.push({x: x, y: y});
  }
  redraw();
};

function redraw() {
  ctx.drawImage(loadedImg, 0, 0);
  drawQuad(frontPoints, '#00e5a8', 'F');
  drawQuad(backPoints, '#ff9f43', 'B');

  document.getElementById('undoBtn').disabled = frontPoints.length === 0;
  document.getElementById('clearBtn').disabled = frontPoints.length === 0;
  document.getElementById('resetBtn').disabled = frontPoints.length === 0 && backPoints.length === 0;
  document.getElementById('flattenBtn').disabled = frontPoints.length !== 4 || backPoints.length !== 4;

  if (frontPoints.length < 4) {
    document.getElementById('tip').textContent = 'FRONT: Click point ' + (frontPoints.length + 1) + ' of 4';
  } else if (backPoints.length < 4) {
    document.getElementById('tip').textContent = 'BACK: Click point ' + (backPoints.length + 1) + ' of 4';
  } else {
    document.getElementById('tip').textContent = 'Both panels marked! Click "Create Combined 2D Flat PNG" below.';
  }
}

function drawQuad(pts, color, label) {
  if (!pts.length) return;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = Math.max(3, canvas.width / 400);
  ctx.beginPath();
  pts.forEach(function(p, i) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
  if (pts.length === 4) ctx.closePath();
  ctx.stroke();

  pts.forEach(function(p, i) {
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(8, canvas.width / 150), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = 'bold ' + Math.max(14, canvas.width / 90) + 'px sans-serif';
    ctx.fillText(label + (i + 1), p.x + 12, p.y - 12);
    ctx.fillStyle = color;
  });
}

document.getElementById('undoBtn').onclick = function() {
  if (backPoints.length > 0) backPoints.pop();
  else if (frontPoints.length > 0) frontPoints.pop();
  redraw();
};

document.getElementById('resetBtn').onclick = function() {
  frontPoints = []; backPoints = []; redraw();
};

document.getElementById('flattenBtn').onclick = function() {
  var w = Number(document.getElementById('outW').value) || 3000;
  var h = Number(document.getElementById('outH').value) || 4000;

  var frontWarped = warpQuadToCanvas(canvas, frontPoints, w, h);
  var backWarped = warpQuadToCanvas(canvas, backPoints, w, h);

  var outCanvas = document.getElementById('outputCanvas');
  outCanvas.width = w * 2 + 40;
  outCanvas.height = h;
  var outCtx = outCanvas.getContext('2d');
  outCtx.fillStyle = '#0a0d14';
  outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
  outCtx.drawImage(frontWarped, 0, 0);
  outCtx.drawImage(backWarped, w + 40, 0);

  document.getElementById('resultCard').style.display = 'block';
  document.getElementById('downloadLink').href = outCanvas.toDataURL('image/png');
  document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth' });
};
</script>
</body>
</html>
`,
};
