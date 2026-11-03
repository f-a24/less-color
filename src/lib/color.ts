import { rgb2hex, rgb2hsl, hsl2rgb, type RGBType } from './convert';
import namedColors from './named-colors';

// r, g, b は 0〜255、a は 0〜1
export type ColorType = { r: number; g: number; b: number; a: number };
// h は 0〜360、s, l, a は 0〜1
export type HSLAType = { h: number; s: number; l: number; a: number };
// 割合の指定。10 と '10%' は同じ意味になる（Less と同じ）
export type AmountType = number | `${number}%`;

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

// 内部の色を 0〜255 に収めて RGBType にする
const toRGBType = ({ r, g, b }: ColorType) =>
  [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)] as RGBType;

const invalid = (input: string) => new TypeError(`Invalid color: ${input}`);

/* 割合を数値に変換する（'10%' => 10） */
export const toAmount = (v: AmountType): number => {
  if (typeof v === 'number') return v;
  const str = v.endsWith('%') ? v.slice(0, -1) : v;
  const n = Number(str);
  if (str.trim() === '' || Number.isNaN(n)) {
    throw new TypeError(`Invalid amount: ${v}`);
  }
  return n;
};

/* 比率を数値に変換する（'43%' => 0.43、0.43 => 0.43） */
export const toRatio = (v: AmountType): number =>
  typeof v === 'string' && v.endsWith('%') ? toAmount(v) / 100 : toAmount(v);

const parseHex = (hex: string): ColorType | undefined => {
  if (!/^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(hex)) {
    return undefined;
  }
  // 短縮形（3 桁・4 桁）は各桁を 2 回繰り返して展開する
  const full =
    hex.length <= 4
      ? hex
          .split('')
          .map(c => c + c)
          .join('')
      : hex;
  const [r, g, b, a = 255] = (full.match(/../g) ?? []).map(s =>
    parseInt(s, 16)
  );
  return { r, g, b, a: a / 255 };
};

// 関数形式の引数を 1 つ数値に変換する。'%' 付きは scale を 100% として換算する
const parseArg = (arg: string, scale: number) => {
  const n = Number(arg.endsWith('%') ? arg.slice(0, -1) : arg);
  if (arg === '' || Number.isNaN(n)) return NaN;
  return arg.endsWith('%') ? (n * scale) / 100 : n;
};

const parseFunction = (str: string): ColorType | undefined => {
  const m = str.match(/^(rgba?|hsla?)\((.*)\)$/);
  if (!m) return undefined;

  // カンマ区切りとスペース区切り（'rgb(0 128 255 / 50%)'）の両方を受け付ける
  const args = m[2].trim().split(/\s*[,/]\s*|\s+/);
  if (args.length !== 3 && args.length !== 4) return undefined;
  const a = args.length === 4 ? parseArg(args[3], 1) : 1;

  let color: ColorType;
  if (m[1].startsWith('rgb')) {
    const [r, g, b] = args.slice(0, 3).map(arg => parseArg(arg, 255));
    color = { r, g, b, a };
  } else {
    const h = parseArg(args[0].replace(/deg$/, ''), 360);
    const s = parseArg(args[1], 1);
    const l = parseArg(args[2], 1);
    color = fromHSLA({ h, s, l, a });
  }

  const values = [color.r, color.g, color.b, color.a];
  if (values.some(Number.isNaN)) return undefined;
  return {
    r: clamp(color.r, 0, 255),
    g: clamp(color.g, 0, 255),
    b: clamp(color.b, 0, 255),
    a: clamp(color.a)
  };
};

/*
 * 色の文字列を解析する
 * 対応形式: '#rgb' / '#rgba' / '#rrggbb' / '#rrggbbaa'（'#' は省略可）、
 * 'rgb()' / 'rgba()' / 'hsl()' / 'hsla()'、CSS の色名、'transparent'
 */
export const parseColor = (input: string): ColorType => {
  const str = input.trim().toLowerCase();
  if (str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  const color =
    (namedColors[str] && parseHex(namedColors[str].slice(1))) ||
    parseHex(str.startsWith('#') ? str.slice(1) : str) ||
    parseFunction(str);
  if (!color) throw invalid(input);
  return color;
};

/*
 * 色を文字列にする
 * Less と同様に、不透明なら '#rrggbb'、半透明なら 'rgba(r, g, b, a)' を返す
 */
export const formatColor = ({ r, g, b, a }: ColorType): string => {
  // Less の出力精度（小数点以下 8 桁、丸め誤差対策の微小値加算も含む）に合わせる
  const alpha = clamp(Number((a + 2e-16).toFixed(8)));
  if (alpha < 1) {
    const rgb = [r, g, b].map(v => Math.round(clamp(v, 0, 255)));
    return `rgba(${rgb.join(', ')}, ${alpha})`;
  }
  return rgb2hex(toRGBType({ r, g, b, a }));
};

export const toHSLA = ({ r, g, b, a }: ColorType): HSLAType => {
  const [h, s, l] = rgb2hsl(toRGBType({ r, g, b, a }));
  return { h, s, l, a };
};

export const fromHSLA = ({ h, s, l, a }: HSLAType): ColorType => {
  const [r, g, b] = hsl2rgb([h, s, l]);
  return { r, g, b, a: clamp(a) };
};

/* WCAG の相対輝度（0〜1、アルファは考慮しない） */
export const relativeLuminance = ({ r, g, b }: ColorType) => {
  const [lr, lg, lb] = [r, g, b].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};
