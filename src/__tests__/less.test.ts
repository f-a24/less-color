import { describe, expect, test } from 'bun:test';
import less from 'less';
import * as lf from '../index.js';

const { color, contrast, mix, tint, shade, spin } = lf;

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
// 半透明の色（contrast 以外の照合に使う）
const alphaColors = ['rgba(51, 102, 153, 0.5)', '#ff000080', 'transparent'];
const allColors = [...colors, ...alphaColors];
const weights = [0, 10, 25, 33, 50, 67, 75, 100];
const angles = [-720, -390, -180, -45, 0, 10, 90, 180, 360, 540];

describe('Less 本家との照合', () => {
  test('mix', async () => {
    for (const c1 of allColors) {
      for (const c2 of allColors) {
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

  test('mix（割合を文字列で指定）', async () => {
    expect(mix('#000000', '#ffffff', '25%')).toBe(
      await evalLess('mix(#000000, #ffffff, 25%)')
    );
  });

  test('tint / shade', async () => {
    for (const c of allColors) {
      for (const w of weights) {
        expect(tint(c, w)).toBe(await evalLess(`tint(${c}, ${w}%)`));
        expect(shade(c, w)).toBe(await evalLess(`shade(${c}, ${w}%)`));
      }
    }
  });

  test('spin', async () => {
    for (const c of allColors) {
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

  const adjusters = {
    saturate: lf.saturate,
    desaturate: lf.desaturate,
    lighten: lf.lighten,
    darken: lf.darken,
    fadein: lf.fadein,
    fadeout: lf.fadeout
  };
  for (const [name, fn] of Object.entries(adjusters)) {
    test(name, async () => {
      for (const c of allColors) {
        for (const w of [0, 10, 33, 50, 100]) {
          expect(fn(c, w)).toBe(await evalLess(`${name}(${c}, ${w}%)`));
          expect(fn(c, w, 'relative')).toBe(
            await evalLess(`${name}(${c}, ${w}%, relative)`)
          );
        }
      }
    });
  }

  test('fade / greyscale', async () => {
    for (const c of allColors) {
      expect(lf.greyscale(c)).toBe(await evalLess(`greyscale(${c})`));
      for (const w of [0, 10, 50, 100]) {
        expect(lf.fade(c, w)).toBe(await evalLess(`fade(${c}, ${w}%)`));
      }
    }
  });

  const getters = {
    hue: lf.hue,
    saturation: lf.saturation,
    lightness: lf.lightness,
    red: lf.red,
    green: lf.green,
    blue: lf.blue,
    alpha: lf.alpha,
    luma: lf.luma,
    luminance: lf.luminance
  };
  // Less で % 表記になるもののうち、こちらでは 0〜1 で返すもの
  const ratioGetters = new Set(['luma', 'luminance']);
  for (const [name, fn] of Object.entries(getters)) {
    test(name, async () => {
      for (const c of allColors) {
        const out = await evalLess(`${name}(${c})`);
        const expected = parseFloat(out) / (ratioGetters.has(name) ? 100 : 1);
        expect(fn(c)).toBeCloseTo(expected, 6);
      }
    });
  }

  const blends = {
    multiply: lf.multiply,
    screen: lf.screen,
    overlay: lf.overlay,
    softlight: lf.softlight,
    hardlight: lf.hardlight,
    difference: lf.difference,
    exclusion: lf.exclusion,
    average: lf.average,
    negation: lf.negation
  };
  for (const [name, fn] of Object.entries(blends)) {
    test(name, async () => {
      for (const c1 of allColors) {
        for (const c2 of allColors) {
          expect(fn(c1, c2)).toBe(await evalLess(`${name}(${c1}, ${c2})`));
        }
      }
    });
  }

  test('入力形式（色名・rgb()・hsl()）', async () => {
    const inputs = [
      'red',
      'RebeccaPurple',
      'rgb(51, 102, 153)',
      'rgb(20%, 40%, 60%)',
      'rgba(51, 102, 153, 0.25)',
      'rgb(51 102 153 / 50%)',
      'hsl(210, 50%, 40%)',
      'hsla(210, 50%, 40%, 0.5)',
      'hsl(210 50% 40% / 0.5)',
      // カンマ区切りの単位なしの彩度・明度は 0〜1 として扱う
      'hsl(120, 0.5, 0.5)',
      'hsl(120, 50%, 0.5)',
      'hsl(120, 50, 50)',
      'hsla(120, 0.5, 0.5, 0.5)',
      '#3369',
      '#33669980'
    ];
    for (const input of inputs) {
      // mix(x, x) は x 自身になり、Less では常に hex か rgba() で出力される
      expect(mix(input, input)).toBe(await evalLess(`mix(${input}, ${input})`));
    }
  });

  // Less は入れ子の途中結果を丸めないので、color() チェーンで同じ結果になることを確かめる
  test('入れ子呼び出し（color() チェーン）', async () => {
    const bases = ['#336699', '#123456', '#fedcba', '#f0e68c', '#7a3b2c'];
    const translucent = 'rgba(51, 102, 153, 0.5)';
    for (const c of [...bases, translucent]) {
      for (const a of [3, 7, 13, 29]) {
        for (const b of [5, 11, 17]) {
          const cases: [string, string][] = [
            [
              color(c).darken(a).lighten(b).toString(),
              `lighten(darken(${c}, ${a}%), ${b}%)`
            ],
            [
              color(c)
                .saturate(a)
                .spin(b * 7)
                .toString(),
              `spin(saturate(${c}, ${a}%), ${b * 7})`
            ],
            [
              color(c).tint(a).mix(color(c).shade(b), 37).toString(),
              `mix(tint(${c}, ${a}%), shade(${c}, ${b}%), 37%)`
            ],
            [
              color(c).multiply('#ff8800').fadeout(a).desaturate(b).toString(),
              `desaturate(fadeout(multiply(${c}, #ff8800), ${a}%), ${b}%)`
            ],
            [
              color(c).softlight(translucent).greyscale().fade(b).toString(),
              `fade(greyscale(softlight(${c}, ${translucent})), ${b}%)`
            ]
          ];
          for (const [ours, expr] of cases) {
            expect(ours).toBe(await evalLess(expr));
          }
        }
      }
    }
  });

  test('入れ子呼び出し（関数に Color を渡す）', async () => {
    for (const c of ['#336699', '#fedcba']) {
      expect(lf.lighten(color(c).darken(3), 5)).toBe(
        await evalLess(`lighten(darken(${c}, 3%), 5%)`)
      );
      expect(lf.contrast(color(c).darken(20))).toBe(
        await evalLess(`contrast(darken(${c}, 20%))`)
      );
    }
  });
});
