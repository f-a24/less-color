import { expect, test } from 'bun:test';
import { rgb2hex, hex2rgb } from '../lib/convert';

test('rgb2hex', () => {
  expect(rgb2hex([0, 0, 0])).toBe('#000000');
  expect(rgb2hex([255, 255, 255])).toBe('#ffffff');
});

test('hex2rgb', () => {
  expect(hex2rgb('#000000')).toStrictEqual([0, 0, 0]);
  expect(hex2rgb('#ffffff')).toStrictEqual([255, 255, 255]);
});
