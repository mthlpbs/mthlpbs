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

export function normalizeStats(stats) {
  if (!stats || !Number.isFinite(stats.total_seconds) || stats.total_seconds < 0) {
    throw new Error('Coding stats must include a valid total_seconds value.');
  }
  if (stats.languages != null && !Array.isArray(stats.languages)) {
    throw new Error('Coding stats languages must be an array.');
  }
  const languages = (stats.languages ?? []).map(language => {
    if (!language || !Number.isFinite(language.percent)) {
      throw new Error('Each language must include a numeric percentage.');
    }
    return {
      name: String(language.name ?? 'unknown'),
      text: String(language.text ?? ''),
      percent: Math.min(100, Math.max(0, language.percent)),
    };
  }).sort((a, b) => b.percent - a.percent).slice(0, 5);

  return {
    total_seconds: stats.total_seconds,
    human_readable_total: String(stats.human_readable_total ?? ''),
    languages: stats.total_seconds > 0 ? languages : [],
  };
}

export function renderBar(percent, color, track) {
  const width = Number((barWidth * percent / 100).toFixed(3));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${barWidth}" height="${barHeight}" viewBox="0 0 ${barWidth} ${barHeight}">
  <title>${percent.toFixed(1)}% of tracked coding time</title>
  <rect width="${barWidth}" height="${barHeight}" rx="6" fill="${track}"/>
${width > 0 ? `  <rect width="${width}" height="${barHeight}" rx="6" fill="${color}"/>\n` : ''}</svg>\n`;
}

async function main() {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: node scripts/render-coding-stats.mjs <stats.json>');
  const stats = normalizeStats(JSON.parse(await readFile(input, 'utf8')));
  const output = fileURLToPath(new URL('../assets/coding-bars/', import.meta.url));
  await mkdir(output, { recursive: true });

  // Keep five stable file names, including on quiet weeks, to avoid stale bars.
  for (let index = 0; index < 5; index++) {
    const language = stats.languages[index];
    const palette = colors[language?.name.toLowerCase()] ?? fallbackColors[index % fallbackColors.length];
    for (const [theme, themeIndex, track] of [['light', 0, '#eaeef2'], ['dark', 1, '#212b36']]) {
      const filename = `${index}-${theme}.svg`;
      await writeFile(join(output, filename), renderBar(language?.percent ?? 0, palette[themeIndex], track));
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
