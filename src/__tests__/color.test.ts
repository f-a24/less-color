import { expect, test } from 'bun:test';
import {
  type ColorType,
  parseColor,
  formatColor,
  toAmount,
  toRatio
} from '../lib/color.js';
import { color, contrast, fade, lighten, mix, spin } from '../index.js';

test('parseColor', () => {
  expect(parseColor('#f80')).toStrictEqual({ r: 255, g: 136, b: 0, a: 1 });
  expect(parseColor('F80')).toStrictEqual({ r: 255, g: 136, b: 0, a: 1 });
  expect(parseColor('#ff000080')).toStrictEqual({
    r: 255,
    g: 0,
    b: 0,
    a: 128 / 255
  });
  expect(parseColor(' Red ')).toStrictEqual({ r: 255, g: 0, b: 0, a: 1 });
  expect(parseColor('transparent')).toStrictEqual({ r: 0, g: 0, b: 0, a: 0 });
  expect(parseColor('rgba(0, 128, 255, 50%)')).toStrictEqual({
    r: 0,
    g: 128,
    b: 255,
    a: 0.5
  });
});

test('parseColor（範囲外の値をクランプ）', () => {
  expect(parseColor('rgb(300, -5, 128)')).toStrictEqual({
    r: 255,
    g: 0,
    b: 128,
    a: 1
  });
});

test('parseColor（不正な入力）', () => {
  for (const input of [
    'zzz',
    '#12',
    '#12345',
    '',
    'rgb(1, 2)',
    'rgb(1, 2, x)',
    'hsl(1, 2, 3, 4, 5)',
    'notacolor',
    // Object.prototype のプロパティ名（入力は小文字化されるので小文字のもの）
    'constructor',
    '__proto__'
  ]) {
    expect(() => parseColor(input)).toThrow(TypeError);
  }
});

test('formatColor', () => {
  expect(formatColor({ r: 255, g: 136, b: 0, a: 1 })).toBe('#ff8800');
  expect(formatColor({ r: 255.4, g: 0, b: 0, a: 0.5 })).toBe(
    'rgba(255, 0, 0, 0.5)'
  );
  expect(formatColor({ r: 0, g: 0, b: 0, a: 1 / 3 })).toBe(
    'rgba(0, 0, 0, 0.33333333)'
  );
});

test('toAmount / toRatio', () => {
  expect(toAmount(10)).toBe(10);
  expect(toAmount('10%')).toBe(10);
  expect(toRatio(0.43)).toBe(0.43);
  expect(toRatio('43%')).toBe(0.43);
  expect(() => toAmount('abc%' as `${number}%`)).toThrow(TypeError);
});

test('割合は数値と文字列のどちらでも指定できる', () => {
  expect(lighten('#336699', '10%')).toBe(lighten('#336699', 10));
  expect(mix('red', 'blue', '25%')).toBe(mix('red', 'blue', 25));
});

test('割合・角度に NaN や Infinity を渡すと TypeError', () => {
  for (const n of [NaN, Infinity, -Infinity]) {
    expect(() => lighten('#336699', n)).toThrow(TypeError);
    expect(() => mix('#000', '#fff', n)).toThrow(TypeError);
    expect(() => fade('#336699', n)).toThrow(TypeError);
    expect(() => spin('#336699', n)).toThrow(TypeError);
    expect(() => contrast('#336699', '#000', '#fff', n)).toThrow(TypeError);
  }
  expect(() => toAmount('Infinity%' as `${number}%`)).toThrow(TypeError);
});

test('hsl() の角度の単位', () => {
  const expected = parseColor('hsl(180, 50%, 50%)');
  for (const h of ['180deg', '0.5turn', '200grad', `${Math.PI}rad`]) {
    const c = parseColor(`hsl(${h}, 50%, 50%)`);
    expect(c.r).toBeCloseTo(expected.r, 6);
    expect(c.g).toBeCloseTo(expected.g, 6);
    expect(c.b).toBeCloseTo(expected.b, 6);
  }
});

test('hsl() の不正な引数は灰色にならず TypeError', () => {
  for (const input of [
    'hsl(abc, 50%, 50%)',
    'hsl(0.5turns, 50%, 50%)',
    'hsl(50%, 50%, 50%)',
    'hsl(deg, 50%, 50%)',
    'hsl(120, x, 50%)',
    'hsla(120, 50%, 50%, y)'
  ]) {
    expect(() => parseColor(input)).toThrow(TypeError);
  }
});

test('ColorType を入力として受け付ける', () => {
  const c = { r: 51, g: 102, b: 153, a: 1 };
  expect(lighten(c, 10)).toBe(lighten('#336699', 10));
  expect(mix(c, '#fff')).toBe(mix('#336699', '#fff'));
  // 途中結果の範囲外の値はクランプせずに保持する（Less と同じ）
  expect(parseColor({ r: 300, g: -1, b: 0, a: 1 })).toStrictEqual({
    r: 300,
    g: -1,
    b: 0,
    a: 1
  });
  for (const bad of [
    { r: NaN, g: 0, b: 0, a: 1 },
    { r: 0, g: 0, b: 0 },
    null,
    42
  ]) {
    expect(() => parseColor(bad as ColorType)).toThrow(TypeError);
  }
});

test('color() チェーン', () => {
  const c = color('#336699');
  // 元の色は変更されない
  expect(c.lighten(10).toString()).toBe(lighten('#336699', 10));
  expect(c.toString()).toBe('#336699');
  expect(c.toObject()).toStrictEqual({ r: 51, g: 102, b: 153, a: 1 });
  expect(c.fade(50).alpha()).toBe(0.5);
  expect(c.hue()).toBe(210);
  expect(`${c.spin(180)}`).toBe('#996633');
  expect(c.contrast().toString()).toBe('#ffffff');
  // Color は ColorType なので、そのまま関数にも渡せる
  expect(lighten(c, 10)).toBe(lighten('#336699', 10));
});

test('hsl() の彩度・明度は単位なしでも 0〜100 として扱う（CSS Color 4）', () => {
  const expected = parseColor('hsl(120, 50%, 50%)');
  expect(parseColor('hsl(120 50 50)')).toStrictEqual(expected);
  expect(parseColor('hsl(120, 50, 50)')).toStrictEqual(expected);
  expect(parseColor('hsla(120 50 50 / 0.5)')).toStrictEqual({
    ...expected,
    a: 0.5
  });
});
