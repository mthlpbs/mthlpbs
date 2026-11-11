import { mkdir, writeFile } from 'node:fs/promises';

// Text-free, self-contained SVGs: GitHub displays them directly as images.
// A short breeze plays once, then settles; reduced-motion users see a still.
const palettes = {
  light: {
    sky: ['#426885', '#9592a5', '#eaa496', '#ffd09b'],
    cloud: '#f6b2a2', upperCloud: '#9b9cac', sun: '#fff0bd',
    mountain: '#737e8c', distant: '#546b7c', forest: '#344e60',
    snow: '#a4b8c5', snowShade: '#7e99ac', ground: '#57758b',
    water: '#6c899e', ink: '#233b4b', coat: '#263d4d', coatLight: '#395062',
    rim: '#ffba85', star: '#fff0d0', starOpacity: '.22',
  },
  dark: {
    sky: ['#1b344f', '#536580', '#b8838b', '#f5ac83'],
    cloud: '#df9690', upperCloud: '#727e98', sun: '#ffe1a0',
    mountain: '#4e6279', distant: '#364f64', forest: '#233e50',
    snow: '#7896ad', snowShade: '#536f87', ground: '#354f65',
    water: '#4b6980', ink: '#152c3b', coat: '#182d3b', coatLight: '#294252',
    rim: '#f7a776', star: '#ffedd0', starOpacity: '.65',
  },
};

function pine(x, y, scale, fill) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="${fill}">
    <path d="M-1 3V-51H1V3ZM0-67-8-46-4-47-14-30-8-32-21-12-10-14-26 1H26L10-14 21-12 8-32 14-30 4-47 8-46Z"/>
  </g>`;
}

function render(p) {
  const farTrees = Array.from({ length: 52 }, (_, i) =>
    pine(i * 20 - 25, 192 + (i % 3) * 2, .22 + ((i * 7) % 9) / 38, p.distant),
  ).join('');
  const nearTrees = [
    [-12, 231, 2.55], [29, 220, 1.3], [62, 219, 1.62], [95, 214, .94],
    [126, 214, 1.4], [158, 212, .76], [191, 211, .97], [226, 209, .58],
    [267, 207, .75], [307, 206, .49], [345, 205, .62],
    [875, 214, .72], [903, 218, 1.15], [942, 225, 1.57], [980, 230, 1.96],
  ].map(([x, y, s]) => pine(x, y, s, p.forest)).join('');
  const sleepers = Array.from({ length: 12 }, (_, i) => {
    const t = (i + 1) / 12;
    const y = 187 + t * t * 139;
    const center = 595 + t * t * 61;
    const width = 3 + t * t * 139;
    return `<path d="M${center - width} ${y}l${width * 2} ${-t * 6}" stroke-width="${1 + t * 4}"/>`;
  }).join('');
  const flakes = Array.from({ length: 20 }, (_, i) => {
    const x = (i * 157 + 37) % 960;
    const y = (i * 73 + 31) % 292;
    return `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 1.3 : .7}"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="300" viewBox="0 0 960 300" fill="none">
  <title>Winter sunset</title>
  <desc>A hooded figure watches a warm sunset beside a quiet snowy railway. Clouds drift, snow floats, and a distant signal glows briefly before the scene settles.</desc>
  <defs>
    <linearGradient id="sky" x2="0" y2="1">
      <stop stop-color="${p.sky[0]}"/><stop offset=".48" stop-color="${p.sky[1]}"/>
      <stop offset=".79" stop-color="${p.sky[2]}"/><stop offset="1" stop-color="${p.sky[3]}"/>
    </linearGradient>
    <radialGradient id="sunlight">
      <stop stop-color="#ffca8a" stop-opacity=".7"/>
      <stop offset=".44" stop-color="#ffb180" stop-opacity=".24"/>
      <stop offset="1" stop-color="#ffad88" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="snow" x2=".2" y2="1">
      <stop stop-color="${p.snow}"/><stop offset="1" stop-color="${p.ground}"/>
    </linearGradient>
    <linearGradient id="reflection" x2="0" y2="1">
      <stop stop-color="#ffd198" stop-opacity=".8"/>
      <stop offset="1" stop-color="#ec997e" stop-opacity=".04"/>
    </linearGradient>
    <linearGradient id="jacket" x2="1" y2=".65">
      <stop stop-color="${p.coatLight}"/><stop offset=".45" stop-color="${p.coat}"/>
      <stop offset="1" stop-color="${p.ink}"/>
    </linearGradient>
    <radialGradient id="signalGlow">
      <stop stop-color="#ff7c6e" stop-opacity=".65"/>
      <stop offset="1" stop-color="#ff7c6e" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="frame"><rect width="960" height="300" rx="16"/></clipPath>
  </defs>
  <style>
    @keyframes breeze { from { transform: translateX(-9px); } to { transform: translateX(0); } }
    @keyframes snowfall { from { transform: translate(-7px,-12px); opacity: 0; } 20% { opacity: .45; } to { transform: translate(0,0); opacity: .22; } }
    @keyframes glow { 0%,100% { opacity: .35; } 50% { opacity: .85; } }
    @keyframes flight { from { transform: translate(14px,3px); } to { transform: translate(0,0); } }
    .snowflakes { opacity: .22; }
    .signal-glow { opacity: .35; }
    @media (prefers-reduced-motion: no-preference) {
      .clouds { animation: breeze 4.8s ease-out both; }
      .snowflakes { animation: snowfall 4.8s ease-out both; }
      .signal-glow { animation: glow 2.4s ease-in-out 2; }
      .birds { animation: flight 4.8s ease-out both; }
    }
  </style>
  <g clip-path="url(#frame)">
    <path fill="url(#sky)" d="M0 0H960V216H0Z"/>
    <ellipse cx="344" cy="168" rx="258" ry="162" fill="url(#sunlight)"/>
    <g fill="${p.star}" opacity="${p.starOpacity}">
      <circle cx="108" cy="28" r=".8"/><circle cx="466" cy="35" r=".7"/>
      <circle cx="587" cy="17" r="1"/><circle cx="756" cy="41" r=".8"/>
      <circle cx="856" cy="24" r=".65"/><circle cx="661" cy="57" r=".65"/>
    </g>
    <g class="clouds">
      <g fill="${p.upperCloud}" opacity=".38">
        <path d="M-30 48 33 40 65 43 110 36 149 41 204 39 173 47 105 48 72 53 14 51Z"/>
        <path d="M381 65 429 58 479 62 513 58 571 64 623 62 594 70 526 69 478 73 426 68Z"/>
        <path d="M715 30 760 26 807 31 856 27 910 32 983 28V34L899 37 854 34 806 38 769 33Z"/>
      </g>
      <g fill="${p.cloud}" opacity=".65">
        <path d="M-14 107 26 103 57 107 94 100 123 105 158 102 197 108 163 112 131 109 97 114 58 110 23 113Z"/>
        <path d="M180 130 213 124 247 127 270 121 307 125 327 123 362 128 326 133 296 130 267 135 237 131 208 134Z"/>
        <path d="M416 106 454 101 478 104 509 99 536 103 578 100 613 107 575 111 535 108 505 113 470 108 445 111Z"/>
        <path d="M633 139 671 133 703 136 738 130 775 134 809 132 854 138 817 142 777 139 744 144 702 140 674 143Z"/>
        <path d="M768 86 805 81 844 86 881 82 917 86 973 82V90L916 94 878 90 845 94 810 89Z"/>
      </g>
      <g stroke="#ffd0ab" stroke-opacity=".65" stroke-linecap="round">
        <path d="m44 124 32-2m-7 7 44-2m32 18 39-3m68-2 26-2m103 6 32-2m24-10 45-2m75 18 43-1m108 9 34-2"/>
        <path d="m239 156 35-2m-17 8 53-2m58-6 38-1m28 11 31-2m-254 4 27-1" stroke-width="2"/>
      </g>
    </g>
    <circle cx="346" cy="169" r="24" fill="${p.sun}"/>
    <path d="m0 190 62-11 44 5 53-13 52 10 57-4 34 11 56-6 45 7 56-16 36 9 38-14 48 16 52-7 33 10 64-13 41 10 57-7 61 14 48-7 47 11V218H0Z" fill="${p.mountain}"/>
    <g>${farTrees}</g>
    <path d="M0 205C142 198 224 211 350 203S540 193 625 199 840 193 960 211V300H0Z" fill="url(#snow)"/>
    <path d="M0 239c106-27 181-7 257-16s118-15 161-12c-100 12-140 25-186 34-62 12-101 12-133 20L0 287Z" fill="${p.snow}" opacity=".5"/>
    <path d="M0 288c117-46 221-31 304-58 23-7 43-15 60-25h-17c-39 16-67 21-111 29C143 250 68 231 0 255Z" fill="${p.water}"/>
    <path d="m343 208-22 9 19-1-42 13 15 1-54 12 16 1-60 17 25-2-63 25 37-8 14 2 47-21-17 1 45-14-10-1 39-15-14 1 22-12Z" fill="url(#reflection)"/>
    <g stroke="${p.rim}" stroke-linecap="round" opacity=".65">
      <path d="m313 219 16-1m-40 12 18-1m-61 18 29-2m-72 19 22-2m-55 14 17-2"/>
    </g>
    <path d="M565 199 521 300H784L613 197Z" fill="${p.snowShade}"/>
    <g stroke="${p.ink}" opacity=".65">${sleepers}</g>
    <path d="m586 186-38 114m51-114 143 114" stroke="${p.ink}" stroke-width="3"/>
    <path d="m585 186-40 114m53-114 140 114" stroke="${p.snow}" stroke-width="1.2"/>
    <g>${nearTrees}</g>
    <path d="M0 222c89-7 106 2 159-6s99 1 155-3l-3 6c-83 2-98 10-155 9s-94 6-156 10Z" fill="${p.snowShade}"/>
    <g stroke="${p.ink}" stroke-linecap="round">
      <path d="M913 20v240m-17-225h35m-33 4h31M827 99v126m-12-116h26M758 142v69m-9-63h20M710 167v40m-7-36h14" stroke-width="3"/>
      <path d="M960 10q-24 24-62 28-29 57-72 71-32 30-68 39-23 17-48 23M960 24q-23 20-45 16-33 59-77 72-38 31-72 38-29 18-49 22" stroke-width="1.2"/>
    </g>
    <g transform="translate(631 183)">
      <path d="M0 0v27m-7-36L7 1M-7 1 7-9" stroke="${p.ink}" stroke-width="2.5"/>
      <rect x="-4" y="2" width="8" height="12" rx="4" fill="${p.ink}"/>
      <circle class="signal-glow" cx="0" cy="7" r="16" fill="url(#signalGlow)"/>
      <circle cx="0" cy="7" r="2.4" fill="#ff8b73"/>
    </g>
    <g class="birds" stroke="${p.ink}" stroke-width="1.4" stroke-linecap="round" opacity=".75">
      <path d="M529 80q5-4 9 1 4-5 9-3m15 12q4-3 7 1 3-4 7-2m-51 8q3-2 5 1 3-3 6-2"/>
    </g>
    <!-- Back view of the short-haired, dark-hooded avatar. -->
    <g stroke="${p.ink}" stroke-linejoin="round">
      <path d="m713 183-1-19 33-2 2 25-15 14Z" fill="#b18877" stroke-width="2"/>
      <path d="M706 147q-4-18 8-29l-3-4 14 1 5-9 4 7 14-9-3 10 14-3-7 9 10 1-5 6q8 16-6 36l-8 10-21-5-10-12Z" fill="${p.ink}" stroke-width="2"/>
      <path d="m710 142 4-16 10-7 11-4-11 10-8 6-2 14" stroke="${p.rim}" stroke-opacity=".7" stroke-width="1.5"/>
      <path d="M713 174q-15 1-19 17l-20 13q-12 7-19 31l-17 65h174l-13-69q-4-20-25-29l-18-13q-6-13-16-14l-9 7Z" fill="url(#jacket)" stroke-width="2"/>
      <path d="M701 185q-11 20 6 32 27 13 54-9l-12-25q-4 24-24 20-13-3-11-20" fill="${p.coatLight}" stroke-width="2"/>
      <path d="M707 217q18 9 31 4l-6 24-14 55h-23l11-49Z" fill="${p.coat}" stroke="none"/>
      <path d="m676 215-12 32-10 53m115-86 9 37 9 49M738 222l5 48-7 30m-58-43 9 10m74-20-9 19" stroke-width="1.6" opacity=".7"/>
      <path d="m709 177-10 9-4 12-21 13-9 20-17 69" stroke="${p.rim}" stroke-width="2" opacity=".75"/>
      <path d="m700 195 5 13 12 6" stroke="${p.rim}" stroke-width="1.2" opacity=".5"/>
    </g>
    <g stroke="${p.ink}" stroke-width="1.5" stroke-linecap="round">
      <path d="m37 282-4-16m4 11 6-9m44 30-7-23m5 15 8-12m44 9-1-14m0 8-7-8m253 25-4-19m3 12 7-13m449 17 5-24m-4 15-7-10m48 18-1-15m1 9 7-9m30 24 4-20"/>
    </g>
    <g fill="${p.snow}" opacity=".65">
      <path d="m8 244 22-2 9 3-26 2Zm118-11 16-2 12 3-23 2Zm223 27 11-2 8 3-15 2Zm486-22 17-1 9 3-21 1Zm53 37 19-1 11 4-25 1Z"/>
    </g>
    <g class="snowflakes" fill="#fff1dd">${flakes}</g>
  </g>
</svg>
`;
}

await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
for (const [theme, palette] of Object.entries(palettes)) {
  await writeFile(new URL(`../assets/profile-${theme}.svg`, import.meta.url), render(palette));
}
