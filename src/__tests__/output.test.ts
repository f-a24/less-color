import { expect, test } from 'bun:test';
import {
  color,
  isValidColor,
  toHex,
  toHsl,
  toHslString,
  toRgb,
  toRgbString
} from '../index';

test('toHex', () => {
  expect(toHex('#336699')).toBe('#336699');
  expect(toHex('red')).toBe('#ff0000');
  expect(toHex('hsl(210, 50%, 40%)')).toBe('#336699');
  expect(toHex('rgba(255, 0, 0, 0.5)')).toBe('#ff000080');
  expect(toHex('transparent')).toBe('#00000000');
  // 2 桁に丸めると ff になるアルファは省略する
  expect(toHex('rgba(255, 0, 0, 0.999)')).toBe('#ff0000');
});

test('toRgb', () => {
  expect(toRgb('#f80')).toStrictEqual({ r: 255, g: 136, b: 0, a: 1 });
  expect(toRgb({ r: 127.5, g: 300, b: -5, a: 0.5 })).toStrictEqual({
    r: 128,
    g: 255,
    b: 0,
    a: 0.5
  });
});

test('toRgbString', () => {
  expect(toRgbString('#336699')).toBe('rgb(51, 102, 153)');
  expect(toRgbString('#33669980')).toBe('rgba(51, 102, 153, 0.50196078)');
  expect(toRgbString('rgb(0 128 255 / 50%)')).toBe('rgba(0, 128, 255, 0.5)');
});

test('toHsl', () => {
  const { h, s, l, a } = toHsl('#336699');
  expect(h).toBeCloseTo(210);
  expect(s).toBeCloseTo(0.5);
  expect(l).toBeCloseTo(0.4);
  expect(a).toBe(1);
});

test('toHslString', () => {
  expect(toHslString('#336699')).toBe('hsl(210, 50%, 40%)');
  expect(toHslString('red')).toBe('hsl(0, 100%, 50%)');
  expect(toHslString('#808080')).toBe('hsl(0, 0%, 50.2%)');
  expect(toHslString('hsla(120, 100%, 25%, 0.3)')).toBe(
    'hsla(120, 100%, 25%, 0.3)'
  );
  // 360 に丸まった色相は 0 にする
  expect(toHslString({ r: 255, g: 0, b: 0.001, a: 1 })).toBe(
    'hsl(0, 100%, 50%)'
  );
});

test('出力関数で往復しても色が変わらない', () => {
  for (const c of ['#336699', '#ff8800', '#0a0b0c', '#ffffff', '#000000']) {
    expect(toHex(toRgbString(c))).toBe(c);
    expect(toHex(toHslString(c))).toBe(c);
  }
  expect(toHex(toRgbString('#33669980'))).toBe('#33669980');
});

test('isValidColor', () => {
  for (const c of ['#f80', 'red', 'rgb(0, 0, 0)', { r: 0, g: 0, b: 0, a: 1 }]) {
    expect(isValidColor(c)).toBe(true);
  }
  for (const c of ['#12', 'notacolor', 'rgb(0, 0)', 123, null, undefined]) {
    expect(isValidColor(c)).toBe(false);
  }
});

test('Color の出力メソッド', () => {
  const c = color('#336699').fade(50);
  expect(c.toHex()).toBe('#33669980');
  expect(c.toRgb()).toStrictEqual({ r: 51, g: 102, b: 153, a: 0.5 });
  expect(c.toRgbString()).toBe('rgba(51, 102, 153, 0.5)');
  expect(c.toHslString()).toBe('hsla(210, 50%, 40%, 0.5)');
  expect(c.toHsl().a).toBe(0.5);
});
