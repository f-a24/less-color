import {
  parseHexDigits,
  rgb2hex,
  rgb2hsl,
  hsl2rgb,
  type RGBType
} from './convert.js';
import namedColors from './named-colors.js';

// r, g, b は 0〜255、a は 0〜1
export type ColorType = { r: number; g: number; b: number; a: number };
// 色を受け取る関数に渡せる値。ColorType を渡すと小数の精度を保ったまま計算できる
export type ColorInput = string | ColorType;
// h は 0〜360、s, l, a は 0〜1
export type HSLAType = { h: number; s: number; l: number; a: number };
// 割合の指定。10 と '10%' は同じ意味になる（Less と同じ）
export type AmountType = number | `${number}%`;

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

// 内部の色を 0〜255 に収めて RGBType にする
const toRGBType = ({ r, g, b }: ColorType) =>
  [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)] as RGBType;

const invalid = (input: unknown) =>
  new TypeError(`Invalid color: ${JSON.stringify(input)}`);

/* 有限の数値であることを検証する。NaN や Infinity は TypeError */
export const toFinite = (n: number, label: string): number => {
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw new TypeError(`Invalid ${label}: ${n}`);
  }
  return n;
};

/* 割合を数値に変換する（'10%' => 10） */
export const toAmount = (v: AmountType): number => {
  if (typeof v === 'number') return toFinite(v, 'amount');
  const str = v.endsWith('%') ? v.slice(0, -1) : v;
  const n = Number(str);
  if (str.trim() === '' || !Number.isFinite(n)) {
    throw new TypeError(`Invalid amount: ${v}`);
  }
  return n;
};

/* 比率を数値に変換する（'43%' => 0.43、0.43 => 0.43） */
export const toRatio = (v: AmountType): number =>
  typeof v === 'string' && v.endsWith('%') ? toAmount(v) / 100 : toAmount(v);

const parseHex = (hex: string): ColorType | undefined => {
  const rgba = parseHexDigits(hex);
  if (!rgba) return undefined;
  const [r, g, b, a] = rgba;
  return { r, g, b, a };
};

// 関数形式の引数を 1 つ数値に変換する。'%' 付きは scale を 100% として換算する
// 不正な値は NaN を返す
const parseArg = (arg: string, scale: number) => {
  const n = Number(arg.endsWith('%') ? arg.slice(0, -1) : arg);
  if (arg === '' || !Number.isFinite(n)) return NaN;
  return arg.endsWith('%') ? (n * scale) / 100 : n;
};

// CSS の角度の単位を度に換算する係数
const angleUnits: Record<string, number> = {
  deg: 1,
  grad: 360 / 400,
  rad: 180 / Math.PI,
  turn: 360
};

// 色相を度で返す。単位なしは度として扱う。不正な値は NaN を返す
const parseHue = (arg: string) => {
  // 'grad' は 'rad' でも終わるので、キーの順序（grad が先）に依存して判定する
  const unit = Object.keys(angleUnits).find(u => arg.endsWith(u));
  const num = unit ? arg.slice(0, -unit.length) : arg;
  const n = Number(num);
  if (num === '' || !Number.isFinite(n)) return NaN;
  return n * angleUnits[unit ?? 'deg'];
};

const parseFunction = (str: string): ColorType | undefined => {
  const m = str.match(/^(rgba?|hsla?)\((.*)\)$/);
  if (!m) return undefined;

  // カンマ区切りとスペース区切り（'rgb(0 128 255 / 50%)'）の両方を受け付ける
  const args = m[2].trim().split(/\s*[,/]\s*|\s+/);
  if (args.length !== 3 && args.length !== 4) return undefined;
  const a = args.length === 4 ? parseArg(args[3], 1) : 1;

  // HSL は RGB に変換すると NaN が消えてしまうため、変換前に検証する
  // 彩度・明度は CSS Color 4 と同じく、単位なしでも 0〜100 として扱う（50 と 50% は同じ）
  const values = m[1].startsWith('rgb')
    ? args.slice(0, 3).map(arg => parseArg(arg, 255))
    : [
        parseHue(args[0]),
        parseArg(args[1], 100) / 100,
        parseArg(args[2], 100) / 100
      ];
  if ([...values, a].some(Number.isNaN)) return undefined;

  const [x, y, z] = values;
  const color = m[1].startsWith('rgb')
    ? { r: x, g: y, b: z, a }
    : fromHSLA({ h: x, s: y, l: z, a });
  return {
    r: clamp(color.r, 0, 255),
    g: clamp(color.g, 0, 255),
    b: clamp(color.b, 0, 255),
    a: clamp(color.a)
  };
};

// ColorType を検証してコピーする。Less と同じく途中結果の範囲外の値はクランプしない
const parseObject = (input: ColorType): ColorType => {
  const { r, g, b, a } = input;
  if (![r, g, b, a].every(v => typeof v === 'number' && Number.isFinite(v))) {
    throw invalid(input);
  }
  return { r, g, b, a };
};

/*
 * 色を解析する
 * 文字列の対応形式: '#rgb' / '#rgba' / '#rrggbb' / '#rrggbbaa'（'#' は省略可）、
 * 'rgb()' / 'rgba()' / 'hsl()' / 'hsla()'、CSS の色名、'transparent'
 * ColorType（color() の戻り値を含む）はそのまま受け付ける
 */
export const parseColor = (input: ColorInput): ColorType => {
  if (typeof input === 'object' && input !== null) return parseObject(input);
  if (typeof input !== 'string') throw invalid(input);
  const str = input.trim().toLowerCase();
  if (str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  // 'constructor' などプロトタイプのプロパティを色名と誤認しないよう hasOwn で判定する
  const color =
    (Object.hasOwn(namedColors, str) && parseHex(namedColors[str])) ||
    parseHex(str) ||
    parseFunction(str);
  if (!color) throw invalid(input);
  return color;
};

/* アルファを Less の出力精度（小数点以下 8 桁、丸め誤差対策の微小値加算も含む）に合わせる */
export const formatAlpha = (a: number) => clamp(Number((a + 2e-16).toFixed(8)));

/*
 * 色を文字列にする
 * Less と同様に、不透明なら '#rrggbb'、半透明なら 'rgba(r, g, b, a)' を返す
 */
export const formatColor = ({ r, g, b, a }: ColorType): string => {
  const alpha = formatAlpha(a);
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
