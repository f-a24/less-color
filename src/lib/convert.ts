// r, g, b は 0〜255
export type RGBType = [r: number, g: number, b: number];
// h は 0〜360、s と l は 0〜1
export type HSLType = [h: number, s: number, l: number];
export type Rgb2HexType = (rgb: RGBType) => string;
export type Hex2RgbType = (hex: string) => RGBType;
export type Rgb2HslType = (rgb: RGBType) => HSLType;
export type Hsl2RgbType = (hsl: HSLType) => RGBType;

/* RGB => HEX */
// Less と同様に 0〜255 に収めてから四捨五入する
export const rgb2hex: Rgb2HexType = rgb =>
  `#${rgb
    .map(v => {
      const n = Math.round(Math.min(255, Math.max(0, v)));
      return `0${n.toString(16)}`.slice(-2);
    })
    .join('')}`;

/* HEX => RGB */
export const hex2rgb: Hex2RgbType = hex => {
  let tmpHex = hex;
  if (hex.slice(0, 1) === '#') tmpHex = hex.slice(1);
  // 3 桁または 6 桁の 16 進数以外は不正な入力として扱う
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(tmpHex)) {
    throw new TypeError(`Invalid hex color: ${hex}`);
  }
  // '#' を除いた後の文字列で短縮形（例: 'f00'）かどうかを判定する
  if (tmpHex.length === 3) {
    tmpHex =
      tmpHex.slice(0, 1) +
      tmpHex.slice(0, 1) +
      tmpHex.slice(1, 2) +
      tmpHex.slice(1, 2) +
      tmpHex.slice(2, 3) +
      tmpHex.slice(2, 3);
  }

  return [tmpHex.slice(0, 2), tmpHex.slice(2, 4), tmpHex.slice(4, 6)].map(str =>
    parseInt(str, 16)
  ) as RGBType;
};

/* RGB => HSL */
export const rgb2hsl: Rgb2HslType = rgb => {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

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
  // 負の値や 360 以上の色相も 0〜360 の範囲に正規化する
  const h = (((hsl[0] % 360) + 360) % 360) / 360;
  const s = Math.min(1, Math.max(0, hsl[1]));
  const l = Math.min(1, Math.max(0, hsl[2]));
  const m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
  const m1 = l * 2 - m2;

  return [
    hue(h + 1 / 3, m1, m2) * 255,
    hue(h, m1, m2) * 255,
    hue(h - 1 / 3, m1, m2) * 255
  ];
};
