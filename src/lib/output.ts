import {
  type ColorInput,
  type ColorType,
  type HSLAType,
  clamp,
  formatAlpha,
  parseColor,
  toHSLA
} from './color';
import { toHexByte } from './convert';

// 小数点以下 digits 桁に丸める（末尾の 0 は付けない）
const round = (n: number, digits = 2) => Number(n.toFixed(digits));

/*
 * 0〜255 の整数に丸めた { r, g, b, a } を返す
 * a は Less の出力と同じ精度（小数点以下 8 桁）に丸める
 */
export const toRgb = (input: ColorInput): ColorType => {
  const { r, g, b, a } = parseColor(input);
  const [rr, gg, bb] = [r, g, b].map(v => Math.round(clamp(v, 0, 255)));
  return { r: rr, g: gg, b: bb, a: formatAlpha(a) };
};

/* 丸めていない { h, s, l, a } を返す（h は 0〜360、s, l, a は 0〜1） */
export const toHsl = (input: ColorInput): HSLAType => toHSLA(parseColor(input));

/* 不透明なら '#rrggbb'、半透明なら '#rrggbbaa' を返す */
export const toHex = (input: ColorInput): string => {
  const { r, g, b, a } = parseColor(input);
  const hex = `#${[r, g, b].map(toHexByte).join('')}`;
  // 2 桁に丸めて 'ff' になるアルファは不透明として扱う
  const alpha = toHexByte(clamp(a) * 255);
  return alpha === 'ff' ? hex : hex + alpha;
};

/* 不透明なら 'rgb(r, g, b)'、半透明なら 'rgba(r, g, b, a)' を返す */
export const toRgbString = (input: ColorInput): string => {
  const { r, g, b, a } = toRgb(input);
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
};

/*
 * 不透明なら 'hsl(h, s%, l%)'、半透明なら 'hsla(h, s%, l%, a)' を返す
 * h, s, l は小数点以下 2 桁に丸める
 */
export const toHslString = (input: ColorInput): string => {
  const { h, s, l, a } = toHsl(input);
  const alpha = formatAlpha(a);
  // 360 に丸まった色相は 0 にそろえる
  const hsl = `${round(h) % 360}, ${round(s * 100)}%, ${round(l * 100)}%`;
  return alpha < 1 ? `hsla(${hsl}, ${alpha})` : `hsl(${hsl})`;
};

/* parseColor が解析できる色かどうかを返す（例外は投げない） */
export const isValidColor = (input: unknown): input is ColorInput => {
  try {
    parseColor(input as ColorInput);
    return true;
  } catch {
    return false;
  }
};
