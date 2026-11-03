import { parseColor, toHSLA } from './color';

/* 色相（0〜360） */
export const hue = (color: string) => toHSLA(parseColor(color)).h;
/* 彩度（0〜100。Less の % 表記と同じ値） */
export const saturation = (color: string) => toHSLA(parseColor(color)).s * 100;
/* 明度（0〜100。Less の % 表記と同じ値） */
export const lightness = (color: string) => toHSLA(parseColor(color)).l * 100;

/* 赤成分（0〜255） */
export const red = (color: string) => parseColor(color).r;
/* 緑成分（0〜255） */
export const green = (color: string) => parseColor(color).g;
/* 青成分（0〜255） */
export const blue = (color: string) => parseColor(color).b;
/* 不透明度（0〜1） */
export const alpha = (color: string) => parseColor(color).a;

/* ガンマ補正なしの輝度（0〜1、アルファを掛けた値） */
export const luminance = (color: string) => {
  const { r, g, b, a } = parseColor(color);
  return ((0.2126 * r) / 255 + (0.7152 * g) / 255 + (0.0722 * b) / 255) * a;
};
