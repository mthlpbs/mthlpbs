import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStats, renderStackedBar, renderLegendDot } from './render-coding-stats.mjs';

function rectangles(svg) {
  return [...svg.matchAll(/<rect x="([\d.]+)" width="([\d.]+)" height="12" fill="([^"]+)"/g)]
    .map(match => ({ x: Number(match[1]), width: Number(match[2]), color: match[3] }));
}

test('selects the five largest shares without rescaling them', () => {
  const result = normalizeStats({
    total_seconds: 3600,
    human_readable_total: '1 hr',
    languages: [3, 27.14, 1, 22.43, 11.57, 10.57, 7.9].map(percent => ({ name: `Language ${percent}`, text: '10 mins', percent })),
  });
  assert.deepEqual(result.languages.map(language => language.percent), [27.14, 22.43, 11.57, 10.57, 7.9]);
  assert.equal(result.segments.at(-1).name, 'Other languages');
  const segments = rectangles(renderStackedBar(result.segments, 0, '#eaeef2'));
  assert.equal(segments[0].width, 162.84);
  assert.ok(Math.abs(segments.at(-1).x + segments.at(-1).width - 600) < 0.002);
  assert.deepEqual(normalizeStats(result), result, 'regeneration preserves the same segments');
});

test('legend circles match each stacked segment in both themes without percentage labels', () => {
  const stats = normalizeStats({ total_seconds: 60, languages: [{ name: 'Rust', percent: 60 }, { name: 'Python', percent: 30 }] });
  for (const theme of [0, 1]) {
    const svg = renderStackedBar(stats.segments, theme, '#eee');
    const segments = rectangles(svg);
    stats.segments.forEach((segment, index) => {
      const dot = renderLegendDot(segment, index, theme);
      assert.ok(dot.includes(`fill="${segments[index].color}"`));
    });
    assert.ok(!svg.includes('%'));
    assert.equal(segments[0].width, 360);
    assert.equal(segments[1].x, 360);
    assert.equal(segments[1].width, 180);
  }
});

test('keeps markup-like language names as plain data for template escaping', () => {
  const result = normalizeStats({ total_seconds: 1, languages: [{ name: '<Rust> & "tools"', text: '1s', percent: 100 }] });
  assert.equal(result.languages[0].name, '<Rust> & "tools"');
});

test('quiet weeks have no displayed languages', () => {
  assert.deepEqual(normalizeStats({ total_seconds: 0, languages: null }).languages, []);
  assert.deepEqual(normalizeStats({ total_seconds: 0, languages: [{ name: 'stale', percent: 30 }] }).segments, []);
  const svg = renderStackedBar([], 0, '#eee');
  assert.deepEqual(rectangles(svg), []);
  assert.ok(!svg.includes('NaN'));
});

test('out-of-range shares cannot overflow the track', () => {
  const result = normalizeStats({ total_seconds: 1, languages: [{ name: 'A', percent: 120 }, { name: 'B', percent: -2 }] });
  assert.deepEqual(result.languages.map(language => language.percent), [100]);
  const oversize = normalizeStats({ total_seconds: 1, languages: [{ name: 'A', percent: 80 }, { name: 'B', percent: 70 }] });
  const segments = rectangles(renderStackedBar(oversize.segments, 0, '#eee'));
  assert.equal(segments[0].width + segments[1].width, 600);
  assert.equal(segments[0].width, 320);
});

test('invalid data fails before publishing a chart', () => {
  for (const stats of [null, {}, { total_seconds: -1 }, { total_seconds: 1, languages: {} }, { total_seconds: 1, languages: [{ percent: '27.1' }] }]) {
    assert.throws(() => normalizeStats(stats));
  }
});
