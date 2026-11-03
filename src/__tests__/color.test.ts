import { expect, test } from 'bun:test';
import { parseColor, formatColor, toAmount, toRatio } from '../lib/color';
import { lighten, mix } from '../index';

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
    'notacolor'
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
