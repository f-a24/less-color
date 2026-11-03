import { expect, test } from 'bun:test';
import { rgb2hex, hex2rgb, hsl2rgb } from '../lib/convert';

test('rgb2hex', () => {
  expect(rgb2hex([0, 0, 0])).toBe('#000000');
  expect(rgb2hex([255, 255, 255])).toBe('#ffffff');
});

test('rgb2hex（四捨五入）', () => {
  expect(rgb2hex([127.5, 127.4, 101.99999])).toBe('#807f66');
});

test('rgb2hex（範囲外の値をクランプ）', () => {
  expect(rgb2hex([300, -5, 128])).toBe('#ff0080');
});

test('hex2rgb（不正な入力）', () => {
  for (const hex of ['zzz', '#12', '#12345', '#ff000080', '']) {
    expect(() => hex2rgb(hex)).toThrow(TypeError);
  }
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
