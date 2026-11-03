// 0〜255 の数値（小数も可）。範囲外の値は各関数がクランプする
// 範囲を検証したい場合は toRGBValue / toRGB を通す
export type RGBValue = number;
// r, g, b は 0〜255
export type RGBType = [r: RGBValue, g: RGBValue, b: RGBValue];
// h は 0〜360、s と l は 0〜1
export type HSLType = [h: number, s: number, l: number];
export type Rgb2HexType = (rgb: RGBType) => string;
export type Hex2RgbType = (hex: string) => RGBType;
export type Rgb2HslType = (rgb: RGBType) => HSLType;
export type Hsl2RgbType = (hsl: HSLType) => RGBType;

/* 数値を RGB の値として検証する。0〜255 の範囲外や NaN は RangeError */
export const toRGBValue = (n: number): RGBValue => {
  if (!(n >= 0 && n <= 255)) {
    throw new RangeError(`RGB value must be between 0 and 255: ${n}`);
  }
  return n;
};

/* 数値の配列を RGBType として検証する */
export const toRGB = (rgb: readonly [number, number, number]): RGBType => [
  toRGBValue(rgb[0]),
  toRGBValue(rgb[1]),
  toRGBValue(rgb[2])
];

// 有限の数値であることを検証する。NaN や Infinity は TypeError
const assertFinite = (values: readonly number[], label: string) => {
  for (const v of values) {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new TypeError(`Invalid ${label} value: ${v}`);
    }
  }
};

const clamp255 = (v: number) => Math.min(255, Math.max(0, v));

/* RGB => HEX */
// Less と同様に 0〜255 に収めてから四捨五入する
export const toHexByte = (v: number) => {
  assertFinite([v], 'RGB');
  const n = Math.round(clamp255(v));
  return `0${n.toString(16)}`.slice(-2);
};

/* RGB => HEX */
export const rgb2hex: Rgb2HexType = rgb => `#${rgb.map(toHexByte).join('')}`;

/*
 * 16 進数の色を [r, g, b, a] に変換する（r, g, b は 0〜255、a は 0〜1）
 * 'rgb' / 'rgba' / 'rrggbb' / 'rrggbbaa'（'#' は省略可）に対応し、不正な形式は undefined を返す
 */
export const parseHexDigits = (
  hex: string
): [r: number, g: number, b: number, a: number] | undefined => {
  const digits = hex.startsWith('#') ? hex.slice(1) : hex;
  if (!/^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(digits)) {
    return undefined;
  }
  // 短縮形（3 桁・4 桁）は各桁を 2 回繰り返して展開する
  const full =
    digits.length <= 4
      ? digits
          .split('')
          .map(c => c + c)
          .join('')
      : digits;
  const [r, g, b, a = 255] = (full.match(/../g) ?? []).map(s =>
    parseInt(s, 16)
  );
  return [r, g, b, a / 255];
};

/* HEX => RGB（アルファ付きの形式も受け付けるが、アルファは捨てる） */
export const hex2rgb: Hex2RgbType = hex => {
  const rgba = parseHexDigits(hex);
  if (!rgba) throw new TypeError(`Invalid hex color: ${hex}`);
  return [rgba[0], rgba[1], rgba[2]];
};

/* RGB => HSL（範囲外の値は 0〜255 にクランプする） */
export const rgb2hsl: Rgb2HslType = rgb => {
  assertFinite(rgb, 'RGB');
  const r = clamp255(rgb[0]) / 255;
  const g = clamp255(rgb[1]) / 255;
  const b = clamp255(rgb[2]) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
};

const hue = (h: number, m1: number, m2: number) => {
  let tmpH = h;
  if (h < 0) {
    tmpH = h + 1;
  } else if (h > 1) {
    tmpH = h - 1;
  }

  if (tmpH * 6 < 1) return m1 + (m2 - m1) * tmpH * 6;
  if (tmpH * 2 < 1) return m2;
  if (tmpH * 3 < 2) return m1 + (m2 - m1) * (2 / 3 - tmpH) * 6;
  return m1;
};

/* HSL => RGB */
export const hsl2rgb: Hsl2RgbType = hsl => {
  assertFinite(hsl, 'HSL');
  // 負の値や 360 以上の色相も 0〜360 の範囲に正規化する
  const h = (((hsl[0] % 360) + 360) % 360) / 360;
  const s = Math.min(1, Math.max(0, hsl[1]));
  const l = Math.min(1, Math.max(0, hsl[2]));
  const m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
  const m1 = l * 2 - m2;

  // 計算上は 0〜255 に収まるので、丸め誤差だけ吸収する
  const [r, g, b] = [
    hue(h + 1 / 3, m1, m2) * 255,
    hue(h, m1, m2) * 255,
    hue(h - 1 / 3, m1, m2) * 255
  ].map(clamp255);
  return [r, g, b];
};
