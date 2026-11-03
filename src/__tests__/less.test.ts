import { describe, expect, test } from 'bun:test';
import less from 'less';
import lf from '../index';

const { contrast, mix, tint, shade, spin } = lf;

// Less 本家で式を評価し、出力された値を返す
const evalLess = async (expr: string) => {
  const { css } = await less.render(`a { b: ${expr}; }`);
  const m = css.match(/b:\s*([^;]+);/);
  if (!m) throw new Error(`Less の出力を解析できません: ${css}`);
  return m[1].trim().toLowerCase();
};

const colors = [
  '#000000',
  '#ffffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#336699',
  '#808080',
  '#f0e68c',
  '#123456',
  '#fedcba'
];
const weights = [0, 10, 25, 33, 50, 67, 75, 100];
const angles = [-720, -390, -180, -45, 0, 10, 90, 180, 360, 540];

describe('Less 本家との照合', () => {
  test('mix', async () => {
    for (const c1 of colors) {
      for (const c2 of colors) {
        for (const w of weights) {
          expect(mix(c1, c2, w)).toBe(
            await evalLess(`mix(${c1}, ${c2}, ${w}%)`)
          );
        }
      }
    }
  });

  test('mix（weight 省略）', async () => {
    expect(mix('#000000', '#ffffff')).toBe(
      await evalLess('mix(#000000, #ffffff)')
    );
  });

  test('tint / shade', async () => {
    for (const c of colors) {
      for (const w of weights) {
        expect(tint(c, w)).toBe(await evalLess(`tint(${c}, ${w}%)`));
        expect(shade(c, w)).toBe(await evalLess(`shade(${c}, ${w}%)`));
      }
    }
  });

  test('spin', async () => {
    for (const c of colors) {
      for (const a of angles) {
        expect(spin(c, a)).toBe(await evalLess(`spin(${c}, ${a})`));
      }
    }
  });

  test('contrast', async () => {
    for (const c of colors) {
      expect(contrast(c)).toBe(await evalLess(`contrast(${c})`));
      expect(contrast(c, '#336699', '#fedcba', 0.3)).toBe(
        await evalLess(`contrast(${c}, #336699, #fedcba, 30%)`)
      );
    }
  });
});
