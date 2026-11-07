/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Curated Pre-loaded High-Quality Sublimation Jersey Mockups
 * matching the user's reference video (Black & Gold Ornate, Esports Cyber Eagle, etc.)
 */

export interface MockupSample {
  id: string;
  name: string;
  category: string;
  description: string;
  svgDataUri?: string;
  imageUrl?: string;
  precomputedFrontUrl?: string;
  precomputedBackUrl?: string;
  defaultFrontCorners: [number, number][]; // in percent [x, y]
  defaultBackCorners: [number, number][]; // in percent [x, y]
  badges: {
    id: string;
    label: string;
    type: 'crest' | 'sponsor' | 'brand' | 'graphic';
    box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
    dominantColors: string[];
  }[];
}

/**
 * Generates an authentic Black & Gold Ornate Jersey mockup (Front & Back)
 * exactly like the one in the video (0:33 and 1:03)!
 */
function createBlackGoldJerseySvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0c10"/>
        <stop offset="100%" stop-color="#141923"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="80%">
        <stop offset="0%" stop-color="#ffe27a"/>
        <stop offset="50%" stop-color="#d4af37"/>
        <stop offset="100%" stop-color="#997a15"/>
      </linearGradient>
      <linearGradient id="goldSoft" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#f5c542" stop-opacity="0.9"/>
        <stop offset="70%" stop-color="#997a15" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#0a0a0d" stop-opacity="0"/>
      </linearGradient>
      <pattern id="filigreePattern" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M60 10 C50 30 20 40 10 60 C20 80 50 90 60 110 C70 90 100 80 110 60 C100 40 70 30 60 10 Z" fill="none" stroke="#d4af37" stroke-width="2.5" opacity="0.35"/>
        <circle cx="60" cy="60" r="14" fill="#997a15" opacity="0.25"/>
        <path d="M0 60 Q30 30 60 60 Q90 90 120 60" fill="none" stroke="#ffe27a" stroke-width="1.5" opacity="0.4"/>
        <path d="M60 0 Q30 30 60 60 Q90 90 60 120" fill="none" stroke="#ffe27a" stroke-width="1.5" opacity="0.4"/>
      </pattern>
      <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.7"/>
      </filter>
    </defs>

    <rect width="1000" height="700" fill="url(#bgGrad)"/>

    <!-- Subtle studio background grid -->
    <g opacity="0.08" stroke="#ffffff" stroke-width="1">
      <line x1="0" y1="175" x2="1000" y2="175"/>
      <line x1="0" y1="350" x2="1000" y2="350"/>
      <line x1="0" y1="525" x2="1000" y2="525"/>
      <line x1="250" y1="0" x2="250" y2="700"/>
      <line x1="500" y1="0" x2="500" y2="700"/>
      <line x1="750" y1="0" x2="750" y2="700"/>
    </g>

    <!-- Studio Title & Sublimation Metadata -->
    <text x="500" y="48" text-anchor="middle" fill="#edf2fa" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="3">ICONIC ROYALE — 3D SUBLIMATION JERSEY MOCKUP</text>
    <text x="500" y="74" text-anchor="middle" fill="#8997ac" font-family="Inter, Arial, sans-serif" font-size="12" letter-spacing="1.5">FRONT &amp; BACK PRINT READY TEMPLATE · FULL PATTERN EXTRACTION</text>

    <!-- LEFT: FRONT JERSEY -->
    <g transform="translate(110, 110)" filter="url(#shadow)">
      <!-- Jersey Body Silhouette -->
      <path d="M70 40 L110 30 Q180 50 250 30 L290 40 L350 140 L280 180 L270 510 L90 510 L80 180 L10 140 Z" fill="#11151c" stroke="#222c3d" stroke-width="2"/>
      <!-- Filigree Sublimation Overlay -->
      <path d="M70 40 L110 30 Q180 50 250 30 L290 40 L350 140 L280 180 L270 510 L90 510 L80 180 L10 140 Z" fill="url(#filigreePattern)"/>
      <path d="M90 280 L270 280 L270 510 L90 510 Z" fill="url(#goldSoft)"/>

      <!-- Golden Chevron / Arch Accents -->
      <path d="M90 400 L180 340 L270 400 L270 440 L180 380 L90 440 Z" fill="url(#goldGrad)" opacity="0.95"/>
      <path d="M110 460 L180 410 L250 460 L250 480 L180 430 L110 480 Z" fill="url(#goldGrad)" opacity="0.85"/>

      <!-- V-Collar Gold Trim -->
      <path d="M120 32 Q180 58 180 115 Q180 58 240 32" fill="none" stroke="url(#goldGrad)" stroke-width="12" stroke-linecap="round"/>
      <path d="M135 34 Q180 58 180 100 Q180 58 225 34" fill="#0d1117"/>

      <!-- Chest Emblem / Badge (Fly High Eagle Crest) -->
      <g transform="translate(180, 175)">
        <polygon points="0,-35 32,-10 26,30 0,42 -26,30 -32,-10" fill="#0a0e17" stroke="url(#goldGrad)" stroke-width="3"/>
        <!-- Eagle Mascot Shape -->
        <path d="M-18,-8 Q0,-26 18,-8 Q8,15 0,26 Q-8,15 -18,-8 Z" fill="url(#goldGrad)"/>
        <path d="M-28,-2 Q-10,-5 -5,12 Q-18,6 -28,-2 Z" fill="#ffe27a"/>
        <path d="M28,-2 Q10,-5 5,12 Q18,6 28,-2 Z" fill="#ffe27a"/>
        <!-- Tiny Stars -->
        <circle cx="0" cy="-22" r="3" fill="#ffe27a"/>
        <circle cx="-10" cy="-20" r="2.2" fill="#ffe27a"/>
        <circle cx="10" cy="-20" r="2.2" fill="#ffe27a"/>
      </g>

      <!-- Center Chest Sponsor Typography -->
      <text x="180" y="260" text-anchor="middle" fill="url(#goldGrad)" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="900" letter-spacing="4">ICONIC</text>
      <text x="180" y="278" text-anchor="middle" fill="#ffe27a" font-family="Inter, Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="6">JERSEY</text>

      <!-- Sleeve Gold Cuffs -->
      <polygon points="10,140 80,180 73,195 3,155" fill="url(#goldGrad)"/>
      <polygon points="350,140 280,180 287,195 357,155" fill="url(#goldGrad)"/>

      <text x="180" y="542" text-anchor="middle" fill="#ffe27a" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700">FRONT VIEW</text>
    </g>

    <!-- RIGHT: BACK JERSEY -->
    <g transform="translate(530, 110)" filter="url(#shadow)">
      <!-- Jersey Body Silhouette -->
      <path d="M70 40 L110 30 Q180 42 250 30 L290 40 L350 140 L280 180 L270 510 L90 510 L80 180 L10 140 Z" fill="#11151c" stroke="#222c3d" stroke-width="2"/>
      <!-- Filigree Sublimation Overlay -->
      <path d="M70 40 L110 30 Q180 42 250 30 L290 40 L350 140 L280 180 L270 510 L90 510 L80 180 L10 140 Z" fill="url(#filigreePattern)"/>
      <path d="M90 280 L270 280 L270 510 L90 510 Z" fill="url(#goldSoft)"/>

      <!-- Golden Lower Arch -->
      <path d="M90 400 L180 340 L270 400 L270 440 L180 380 L90 440 Z" fill="url(#goldGrad)" opacity="0.95"/>
      <path d="M110 460 L180 410 L250 460 L250 480 L180 430 L110 480 Z" fill="url(#goldGrad)" opacity="0.85"/>

      <!-- Back Neck Collar -->
      <path d="M110 30 Q180 46 250 30" fill="none" stroke="url(#goldGrad)" stroke-width="12" stroke-linecap="round"/>

      <!-- Player Name -->
      <text x="180" y="160" text-anchor="middle" fill="url(#goldGrad)" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900" letter-spacing="5">CHAMPION</text>

      <!-- Player Number -->
      <text x="180" y="280" text-anchor="middle" fill="url(#goldGrad)" font-family="Inter, Arial, sans-serif" font-size="105" font-weight="900" letter-spacing="-2">10</text>

      <!-- Sleeve Cuffs -->
      <polygon points="10,140 80,180 73,195 3,155" fill="url(#goldGrad)"/>
      <polygon points="350,140 280,180 287,195 357,155" fill="url(#goldGrad)"/>

      <text x="180" y="542" text-anchor="middle" fill="#ffe27a" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700">BACK VIEW</text>
    </g>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/**
 * Generates Cyber Phoenix Esports Sublimation Jersey
 * (matching the blue eagle badge in video at 0:34!)
 */
function createEsportsEagleJerseySvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
    <defs>
      <linearGradient id="cyberBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#080e1a"/>
        <stop offset="100%" stop-color="#0d182b"/>
      </linearGradient>
      <linearGradient id="cyanNeon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f0ff"/>
        <stop offset="100%" stop-color="#0066ff"/>
      </linearGradient>
      <linearGradient id="orangeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff7b00"/>
        <stop offset="100%" stop-color="#ff0055"/>
      </linearGradient>
      <pattern id="hexGrid" width="60" height="104" patternUnits="userSpaceOnUse">
        <path d="M30 0 L60 17 L60 52 L30 69 L0 52 L0 17 Z M30 104 L60 87 L60 52 L30 69 L0 52 L0 87 Z" fill="none" stroke="#00f0ff" stroke-width="1.2" opacity="0.2"/>
      </pattern>
      <filter id="esportsGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <rect width="1000" height="700" fill="url(#cyberBg)"/>

    <text x="500" y="48" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="900" letter-spacing="3">CYBER PHOENIX — ESPORTS APPAREL MOCKUP</text>
    <text x="500" y="74" text-anchor="middle" fill="#00f0ff" font-family="Inter, Arial, sans-serif" font-size="12" letter-spacing="1.5">HIGH-CONTRAST HEXAGON MESH · WINGED MASCOT CREST</text>

    <!-- FRONT JERSEY -->
    <g transform="translate(120, 110)">
      <path d="M70 40 L110 30 Q180 50 250 30 L290 40 L350 140 L280 180 L270 510 L90 510 L80 180 L10 140 Z" fill="#0f1624" stroke="#00f0ff" stroke-width="2"/>
      <path d="M70 40 L110 30 Q180 50 250 30 L290 40 L350 140 L280 180 L270 510 L90 510 L80 180 L10 140 Z" fill="url(#hexGrid)"/>

      <!-- Dynamic diagonal energy slashes -->
      <path d="M70 280 L270 180 L290 220 L90 320 Z" fill="url(#cyanNeon)" opacity="0.7"/>
      <path d="M80 340 L270 250 L280 275 L90 365 Z" fill="url(#orangeGlow)" opacity="0.85"/>

      <!-- Large Cyber Eagle / Phoenix Crest (Exact match to video eagle logo!) -->
      <g transform="translate(180, 210)" filter="url(#esportsGlow)">
        <!-- Outer Shield -->
        <polygon points="0,-60 55,-25 45,50 0,70 -45,50 -55,-25" fill="#091122" stroke="url(#cyanNeon)" stroke-width="4"/>
        <!-- Fierce Eagle Head & Wings -->
        <path d="M0,-45 Q-30,-20 -40,10 Q-20,0 -10,-10 Q-5,15 0,25 Q5,15 10,-10 Q20,0 40,10 Q30,-20 0,-45 Z" fill="url(#cyanNeon)"/>
        <!-- Golden Beak & Eyes -->
        <polygon points="0,-12 12,5 -12,5" fill="#ffb700"/>
        <circle cx="-12" cy="-15" r="3" fill="#ffffff"/>
        <circle cx="12" cy="-15" r="3" fill="#ffffff"/>
      </g>

      <!-- Bottom Team Sponsor -->
      <text x="180" y="380" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="900" letter-spacing="3">TITAN CLAN</text>
      <text x="180" y="405" text-anchor="middle" fill="#00f0ff" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="4">SUBLIMATION LAB</text>
      <text x="180" y="542" text-anchor="middle" fill="#00f0ff" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700">FRONT VIEW</text>
    </g>

    <!-- BACK JERSEY -->
    <g transform="translate(540, 110)">
      <path d="M70 40 L110 30 Q180 42 250 30 L290 40 L350 140 L280 180 L270 510 L90 510 L80 180 L10 140 Z" fill="#0f1624" stroke="#00f0ff" stroke-width="2"/>
      <path d="M70 40 L110 30 Q180 42 250 30 L290 40 L350 140 L280 180 L270 510 L90 510 L80 180 L10 140 Z" fill="url(#hexGrid)"/>

      <!-- Slashes -->
      <path d="M70 280 L270 180 L290 220 L90 320 Z" fill="url(#cyanNeon)" opacity="0.7"/>

      <text x="180" y="160" text-anchor="middle" fill="#00f0ff" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="900" letter-spacing="6">PHOENIX</text>
      <text x="180" y="300" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="110" font-weight="900">07</text>

      <text x="180" y="542" text-anchor="middle" fill="#00f0ff" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700">BACK VIEW</text>
    </g>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/**
 * Generates the authentic Thunder Cream & Orange Raglan Sublimation Jersey
 * exactly matching the user's uploaded reference image (image_c866f91a.png)!
 */
function createThunderCreamRaglanSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 600" width="1024" height="600">
    <defs>
      <linearGradient id="studioDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#111317"/>
        <stop offset="100%" stop-color="#181c24"/>
      </linearGradient>
      <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ff7b00"/>
        <stop offset="100%" stop-color="#e05200"/>
      </linearGradient>
      <linearGradient id="brownSleeve" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3d221e"/>
        <stop offset="100%" stop-color="#4d2b26"/>
      </linearGradient>
      <pattern id="lightningPattern" width="70" height="90" patternUnits="userSpaceOnUse">
        <path d="M25 0 L15 35 L30 35 L18 80 L38 40 L25 40 Z" fill="#e8e5dc" opacity="0.38"/>
        <path d="M60 10 L50 45 L65 45 L53 90 L73 50 L60 50 Z" fill="#e8e5dc" opacity="0.38"/>
        <line x1="0" y1="20" x2="70" y2="20" stroke="#dfdad0" stroke-width="0.8" opacity="0.25"/>
        <line x1="0" y1="50" x2="70" y2="50" stroke="#dfdad0" stroke-width="0.8" opacity="0.25"/>
        <line x1="0" y1="80" x2="70" y2="80" stroke="#dfdad0" stroke-width="0.8" opacity="0.25"/>
      </pattern>
      <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.8"/>
      </filter>
    </defs>

    <rect width="1024" height="600" fill="url(#studioDark)"/>

    <text x="512" y="38" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="900" letter-spacing="2">THUNDER RAGLAN KIT — 3D MOCKUP</text>
    <text x="512" y="60" text-anchor="middle" fill="#e05200" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5">FRONT &amp; BACK VIEW · EXACT MATCH TO PRODUCTION PRINT KIT</text>

    <!-- FRONT MOCKUP (LEFT) -->
    <g transform="translate(70, 80)" filter="url(#dropShadow)">
      <!-- Brown Sleeves underlay -->
      <!-- Left Sleeve -->
      <path d="M70 50 L10 170 L75 195 L95 130 Z" fill="url(#brownSleeve)"/>
      <!-- Left Sleeve Cuff Stripes -->
      <line x1="12" y1="162" x2="72" y2="187" stroke="#ff7b00" stroke-width="3" opacity="0.9"/>
      <line x1="15" y1="152" x2="70" y2="177" stroke="#ff7b00" stroke-width="2.5" opacity="0.75"/>
      <line x1="18" y1="142" x2="68" y2="167" stroke="#ff7b00" stroke-width="2" opacity="0.55"/>
      <!-- Right Sleeve -->
      <path d="M310 50 L370 170 L305 195 L285 130 Z" fill="url(#brownSleeve)"/>
      <line x1="368" y1="162" x2="308" y2="187" stroke="#ff7b00" stroke-width="3" opacity="0.9"/>
      <line x1="365" y1="152" x2="310" y2="177" stroke="#ff7b00" stroke-width="2.5" opacity="0.75"/>
      <line x1="362" y1="142" x2="312" y2="167" stroke="#ff7b00" stroke-width="2" opacity="0.55"/>

      <!-- Front Cream Body Silhouette -->
      <path d="M85 45 L135 15 Q190 28 245 15 L295 45 L285 440 Q190 455 95 440 Z" fill="#f4f1ea"/>
      <!-- Sublimation Lightning Texture -->
      <path d="M85 45 L135 15 Q190 28 245 15 L295 45 L285 440 Q190 455 95 440 Z" fill="url(#lightningPattern)"/>

      <!-- Raglan Shoulder Top Wedges (Brown + Dark Purple Trim) -->
      <polygon points="85,45 135,15 155,50 80,75" fill="#4d2b26"/>
      <polygon points="295,45 245,15 225,50 300,75" fill="#4d2b26"/>
      <line x1="85" y1="45" x2="155" y2="50" stroke="#372f52" stroke-width="3"/>
      <line x1="295" y1="45" x2="225" y2="50" stroke="#372f52" stroke-width="3"/>

      <!-- Side Orange Panels -->
      <path d="M88 230 L102 360 L97 420 L86 420 Z" fill="url(#orangeGrad)"/>
      <path d="M292 230 L278 360 L283 420 L294 420 Z" fill="url(#orangeGrad)"/>

      <!-- Crewneck Orange Collar -->
      <path d="M135 15 Q190 58 245 15 Q190 32 135 15 Z" fill="#ff7b00"/>
      <path d="M142 16 Q190 50 238 16" fill="none" stroke="#e05200" stroke-width="3"/>

      <text x="190" y="475" text-anchor="middle" fill="#ff7b00" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="800">FRONT VIEW</text>
    </g>

    <!-- BACK MOCKUP (RIGHT) -->
    <g transform="translate(540, 80)" filter="url(#dropShadow)">
      <!-- Brown Sleeves -->
      <path d="M70 50 L10 170 L75 195 L95 130 Z" fill="url(#brownSleeve)"/>
      <line x1="12" y1="162" x2="72" y2="187" stroke="#ff7b00" stroke-width="3" opacity="0.9"/>
      <path d="M310 50 L370 170 L305 195 L285 130 Z" fill="url(#brownSleeve)"/>
      <line x1="368" y1="162" x2="308" y2="187" stroke="#ff7b00" stroke-width="3" opacity="0.9"/>

      <!-- Back Cream Body Silhouette -->
      <path d="M85 45 L135 18 Q190 22 245 18 L295 45 L285 440 Q190 455 95 440 Z" fill="#f4f1ea"/>
      <!-- Sublimation Texture -->
      <path d="M85 45 L135 18 Q190 22 245 18 L295 45 L285 440 Q190 455 95 440 Z" fill="url(#lightningPattern)"/>

      <!-- Upper Back Yoke and Raglan Seams -->
      <polygon points="85,45 135,18 190,45 80,75" fill="#4d2b26"/>
      <polygon points="295,45 245,18 190,45 300,75" fill="#4d2b26"/>
      <line x1="135" y1="18" x2="190" y2="45" stroke="#ff7b00" stroke-width="2.5"/>
      <line x1="245" y1="18" x2="190" y2="45" stroke="#ff7b00" stroke-width="2.5"/>

      <!-- Back Orange Framing Brackets -->
      <path d="M110 170 L145 170 L145 330 L115 315 Z" fill="none" stroke="#ff7b00" stroke-width="8"/>
      <path d="M270 170 L235 170 L235 330 L265 315 Z" fill="none" stroke="#ff7b00" stroke-width="8"/>

      <!-- Back Neck Collar -->
      <path d="M135 18 Q190 25 245 18" fill="none" stroke="#ff7b00" stroke-width="10" stroke-linecap="round"/>

      <text x="190" y="475" text-anchor="middle" fill="#ff7b00" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="800">BACK VIEW</text>
    </g>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export const SAMPLE_MOCKUPS: MockupSample[] = [
  {
    id: 'grunge-bw-polo',
    name: 'Grunge B&W Polo (Your Upload - Front & Back)',
    category: 'Front & Back Polo · Roster Blank Ready',
    description: 'Black & white grunge splatter texture, starball chest crest on front, clean roster-ready number box on back.',
    imageUrl: '/assets/aistudio/flakit-coolar-22_fe9132a0.jpg',
    precomputedFrontUrl: '/assets/aistudio/Frontcc_04ed0419.jpg',
    precomputedBackUrl: '/assets/aistudio/Back_1e304b8d.jpg',
    defaultFrontCorners: [
      [16, 14], // TL
      [43, 14], // TR
      [42, 86], // BR
      [17, 86], // BL
    ],
    defaultBackCorners: [
      [57, 14], // TL
      [84, 14], // TR
      [83, 86], // BR
      [58, 86], // BL
    ],
    badges: [
      {
        id: 'badge-crest-starball',
        label: 'Champions Starball Chest Crest',
        type: 'crest',
        box: [260, 275, 410, 365],
        dominantColors: ['#ffffff', '#111111'],
      },
      {
        id: 'badge-back-number-box',
        label: 'Back Player Roster Box (Blanked for Print)',
        type: 'graphic',
        box: [290, 600, 560, 810],
        dominantColors: ['#000000', '#ffffff'],
      },
      {
        id: 'badge-front-placket',
        label: 'Polo Button Placket & Collar',
        type: 'graphic',
        box: [130, 260, 340, 335],
        dominantColors: ['#000000', '#ffffff'],
      },
    ],
  },
  {
    id: 'thunder-cream-raglan',
    name: 'Thunder Cream & Orange Raglan (4-Piece)',
    category: 'Full Sublimation Kit (4-Piece)',
    description: 'Cream lightning watermark body, brown raglan sleeves, orange speed stripe cuffs & collar.',
    svgDataUri: createThunderCreamRaglanSvg(),
    defaultFrontCorners: [
      [14, 18], // TL
      [36, 18], // TR
      [34, 84], // BR
      [16, 84], // BL
    ],
    defaultBackCorners: [
      [60, 18], // TL
      [82, 18], // TR
      [80, 84], // BR
      [62, 84], // BL
    ],
    badges: [
      {
        id: 'badge-crewneck-orange',
        label: 'Crewneck Ribbed Collar Arch',
        type: 'graphic',
        box: [160, 180, 260, 320],
        dominantColors: ['#ff7b00', '#e05200', '#f4f1ea'],
      },
      {
        id: 'badge-raglan-cuff-left',
        label: 'Left Sleeve Speed Stripes',
        type: 'graphic',
        box: [290, 80, 420, 160],
        dominantColors: ['#ff7b00', '#4d2b26'],
      },
      {
        id: 'badge-back-brackets',
        label: 'Back Framing Brackets Accent',
        type: 'graphic',
        box: [320, 630, 620, 800],
        dominantColors: ['#ff7b00', '#f4f1ea'],
      },
    ],
  },
  {
    id: 'black-gold-royale',
    name: 'Iconic Royale — Black & Gold Ornate',
    category: 'Pro Football / Soccer',
    description: 'Gold baroque filigree, chest eagle shield crest, front & back view as seen in the video.',
    svgDataUri: createBlackGoldJerseySvg(),
    defaultFrontCorners: [
      [18, 20], // TL
      [40, 20], // TR
      [38, 86], // BR
      [20, 86], // BL
    ],
    defaultBackCorners: [
      [60, 20], // TL
      [82, 20], // TR
      [80, 86], // BR
      [62, 86], // BL
    ],
    badges: [
      {
        id: 'badge-crest-gold-eagle',
        label: 'Fly High Eagle Shield Crest',
        type: 'crest',
        box: [290, 240, 440, 340], // [ymin, xmin, ymax, xmax]
        dominantColors: ['#d4af37', '#ffe27a', '#0a0e17'],
      },
      {
        id: 'badge-sponsor-iconic',
        label: 'Chest Brand Typography (ICONIC JERSEY)',
        type: 'sponsor',
        box: [450, 210, 530, 370],
        dominantColors: ['#ffe27a', '#d4af37'],
      },
      {
        id: 'badge-back-number-10',
        label: 'Back Number #10 Gold Spec',
        type: 'graphic',
        box: [300, 650, 520, 780],
        dominantColors: ['#d4af37', '#ffe27a'],
      },
    ],
  },
  {
    id: 'esports-cyber-eagle',
    name: 'Cyber Phoenix — Esports Kit',
    category: 'Gaming / Esports',
    description: 'Neon cyan hex grid, high-contrast eagle mascot crest, angular energy slashes.',
    svgDataUri: createEsportsEagleJerseySvg(),
    defaultFrontCorners: [
      [19, 20],
      [41, 20],
      [39, 86],
      [21, 86],
    ],
    defaultBackCorners: [
      [61, 20],
      [83, 20],
      [81, 86],
      [63, 86],
    ],
    badges: [
      {
        id: 'badge-phoenix-crest',
        label: 'Cyber Eagle Crest Badge',
        type: 'crest',
        box: [260, 240, 480, 360],
        dominantColors: ['#00f0ff', '#0066ff', '#ffb700'],
      },
      {
        id: 'badge-titan-sponsor',
        label: 'Titan Clan Chest Wordmark',
        type: 'sponsor',
        box: [620, 220, 710, 380],
        dominantColors: ['#ffffff', '#00f0ff'],
      },
      {
        id: 'badge-phoenix-back-07',
        label: 'Back Player 07 Number',
        type: 'graphic',
        box: [310, 660, 540, 790],
        dominantColors: ['#ffffff', '#00f0ff'],
      },
    ],
  },
];
