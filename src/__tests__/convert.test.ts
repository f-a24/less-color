import { expect, test } from 'bun:test';
import {
  rgb2hex,
  hex2rgb,
  hsl2rgb,
  toRGB,
  toRGBValue,
  type RGBType
} from '../lib/convert';

test('rgb2hex', () => {
  expect(rgb2hex([0, 0, 0])).toBe('#000000');
  expect(rgb2hex([255, 255, 255])).toBe('#ffffff');
});

test('rgb2hex（四捨五入）', () => {
  expect(rgb2hex([127.5, 127.4, 101.99999])).toBe('#807f66');
});

test('rgb2hex（範囲外の値はクランプ）', () => {
  const rgb: RGBType = [300, -5, 128];
  expect(rgb2hex(rgb)).toBe('#ff0080');
});

test('toRGBValue / toRGB', () => {
  expect(toRGBValue(0)).toBe(0);
  expect<number>(toRGBValue(127.5)).toBe(127.5);
  expect(toRGBValue(255)).toBe(255);
  expect(toRGB([1, 2, 3])).toStrictEqual([1, 2, 3]);
  for (const n of [-1, 255.1, NaN, Infinity]) {
    expect(() => toRGBValue(n)).toThrow(RangeError);
  }
  expect(() => toRGB([0, 0, 256])).toThrow(RangeError);
});

test('hex2rgb（不正な入力）', () => {
  for (const hex of ['zzz', '#12', '#12345', '#1234567', '##f80', '']) {
    expect(() => hex2rgb(hex)).toThrow(TypeError);
  }
});

test('hex2rgb（アルファ付きの形式はアルファを捨てる）', () => {
  expect(hex2rgb('#ff000080')).toStrictEqual([255, 0, 0]);
  expect(hex2rgb('#f808')).toStrictEqual([255, 136, 0]);
  expect(hex2rgb('F80')).toStrictEqual([255, 136, 0]);
});

test('hsl2rgb（負・360 以上の色相）', () => {
  expect(hsl2rgb([-300, 1, 0.5]).map(Math.round)).toStrictEqual([255, 255, 0]);
  expect(hsl2rgb([420, 1, 0.5]).map(Math.round)).toStrictEqual([255, 255, 0]);
});

test('hex2rgb', () => {
  expect(hex2rgb('#000000')).toStrictEqual([0, 0, 0]);
  expect(hex2rgb('#ffffff')).toStrictEqual([255, 255, 255]);
});

test('hex2rgb（短縮形）', () => {
  expect(hex2rgb('#000')).toStrictEqual([0, 0, 0]);
  expect(hex2rgb('#f80')).toStrictEqual([255, 136, 0]);
  expect(hex2rgb('f80')).toStrictEqual([255, 136, 0]);
});
