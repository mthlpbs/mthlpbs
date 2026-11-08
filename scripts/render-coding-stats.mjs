import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const barWidth = 600;
const barHeight = 12;
const colors = {
  unknown: ['#7d8590', '#99a8bb'],
  rust: ['#c86e46', '#e69670'],
  python: ['#3572a5', '#70b6e5'],
  markdown: ['#2089bd', '#63c3e5'],
  powershell: ['#3976d9', '#79aaff'],
};
const fallbackColors = [
  ['#087f70', '#50d4b7'],
  ['#7664bd', '#b8a2f3'],
  ['#2476b5', '#79c0ff'],
];
const otherColors = ['#c5ced8', '#526071'];

export function normalizeStats(stats) {
  if (!stats || !Number.isFinite(stats.total_seconds) || stats.total_seconds < 0) {
    throw new Error('Coding stats must include a valid total_seconds value.');
  }
  if (stats.languages != null && !Array.isArray(stats.languages)) {
    throw new Error('Coding stats languages must be an array.');
  }
  let languages = (stats.languages ?? []).map(language => {
    if (!language || !Number.isFinite(language.percent)) {
      throw new Error('Each language must include a numeric percentage.');
    }
    return {
      name: String(language.name ?? 'unknown'),
      text: String(language.text ?? ''),
      percent: Math.min(100, Math.max(0, language.percent)),
    };
  }).filter(language => language.percent > 0)
    .sort((a, b) => b.percent - a.percent).slice(0, 5);

  if (stats.total_seconds === 0) languages = [];
  const share = languages.reduce((sum, language) => sum + language.percent, 0);
  const segments = languages.map(language => ({ ...language }));
  if (segments.length && share < 100 - 0.001) {
    segments.push({ name: 'Other languages', text: '', percent: 100 - share, other: true });
  }

  return {
    total_seconds: stats.total_seconds,
    human_readable_total: String(stats.human_readable_total ?? ''),
    languages,
    segments,
  };
}

function segmentColor(segment, index, themeIndex) {
  if (segment?.other) return otherColors[themeIndex];
  const key = segment?.name.toLowerCase();
  const palette = Object.hasOwn(colors, key) ? colors[key] : fallbackColors[index % fallbackColors.length];
  return palette[themeIndex];
}

export function renderStackedBar(segments, themeIndex, track) {
  const total = segments.reduce((sum, segment) => sum + segment.percent, 0);
  let offset = 0;
  const rectangles = segments.map((segment, index) => {
    const start = offset;
    const width = total > 0 ? barWidth * segment.percent / total : 0;
    offset += width;
    return `    <rect x="${Number(start.toFixed(3))}" width="${Number(width.toFixed(3))}" height="${barHeight}" fill="${segmentColor(segment, index, themeIndex)}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${barWidth}" height="${barHeight}" viewBox="0 0 ${barWidth} ${barHeight}">
  <title>Weekly coding time by language</title>
  <defs><clipPath id="bar"><rect width="${barWidth}" height="${barHeight}" rx="6"/></clipPath></defs>
  <rect width="${barWidth}" height="${barHeight}" rx="6" fill="${track}"/>
  <g clip-path="url(#bar)">
${rectangles.join('\n')}
  </g>
</svg>\n`;
}

export function renderLegendDot(segment, index, themeIndex) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="${segmentColor(segment, index, themeIndex)}"/></svg>\n`;
}

async function main() {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: node scripts/render-coding-stats.mjs <stats.json>');
  const stats = normalizeStats(JSON.parse(await readFile(input, 'utf8')));
  const output = fileURLToPath(new URL('../assets/coding-bars/', import.meta.url));
  await mkdir(output, { recursive: true });

  for (const [theme, themeIndex, track] of [['light', 0, '#eaeef2'], ['dark', 1, '#212b36']]) {
    await writeFile(join(output, `weekly-${theme}.svg`), renderStackedBar(stats.segments, themeIndex, track));
    // Five languages and one optional remainder use stable legend file names.
    for (let index = 0; index < 6; index++) {
      await writeFile(join(output, `legend-${index}-${theme}.svg`), renderLegendDot(stats.segments[index], index, themeIndex));
    }
  }
  // The README consumes this exact snapshot so its labels match the bar widths.
  await writeFile(input, JSON.stringify(stats, null, 2) + '\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
