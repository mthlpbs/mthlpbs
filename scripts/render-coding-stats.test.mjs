import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStats, renderBar } from './render-coding-stats.mjs';

test('selects the five largest shares without rescaling them', () => {
  const result = normalizeStats({
    total_seconds: 3600,
    human_readable_total: '1 hr',
    languages: [3, 27.14, 1, 22.43, 11.57, 10.57, 7.9].map(percent => ({ name: `Language ${percent}`, text: '10 mins', percent })),
  });
  assert.deepEqual(result.languages.map(language => language.percent), [27.14, 22.43, 11.57, 10.57, 7.9]);
  // 27.14% of the 600-unit track is 162.84, rather than a full-width bar.
  assert.match(renderBar(result.languages[0].percent, '#7d8590', '#eaeef2'), /<rect width="162\.84"/);
});

test('keeps markup-like language names as plain data for template escaping', () => {
  const result = normalizeStats({ total_seconds: 1, languages: [{ name: '<Rust> & "tools"', text: '1s', percent: 100 }] });
  assert.equal(result.languages[0].name, '<Rust> & "tools"');
});

test('quiet weeks have no displayed languages', () => {
  assert.deepEqual(normalizeStats({ total_seconds: 0, languages: null }).languages, []);
  assert.deepEqual(normalizeStats({ total_seconds: 0, languages: [{ name: 'stale', percent: 30 }] }).languages, []);
  assert.equal((renderBar(0, '#000', '#eee').match(/<rect/g) ?? []).length, 1);
});

test('out-of-range shares cannot overflow the track', () => {
  const result = normalizeStats({ total_seconds: 1, languages: [{ name: 'A', percent: 120 }, { name: 'B', percent: -2 }] });
  assert.deepEqual(result.languages.map(language => language.percent), [100, 0]);
});

test('invalid data fails before publishing a chart', () => {
  for (const stats of [null, {}, { total_seconds: -1 }, { total_seconds: 1, languages: {} }, { total_seconds: 1, languages: [{ percent: '27.1' }] }]) {
    assert.throws(() => normalizeStats(stats));
  }
});
