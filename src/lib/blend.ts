import {
  type ColorInput,
  type ColorType,
  formatColor,
  parseColor
} from './color';

// cb は背景（color1）、cs は前景（color2）の 0〜1 の成分値
type BlendModeType = (cb: number, cs: number) => number;
export type BlendType = (color1: ColorInput, color2: ColorInput) => string;
type BlendColorType = (c1: ColorType, c2: ColorType) => ColorType;

const multiplyMode: BlendModeType = (cb, cs) => cb * cs;
const screenMode: BlendModeType = (cb, cs) => cb + cs - cb * cs;
const overlayMode: BlendModeType = (cb, cs) => {
  const cb2 = cb * 2;
  return cb2 <= 1 ? multiplyMode(cb2, cs) : screenMode(cb2 - 1, cs);
};
const softlightMode: BlendModeType = (cb, cs) => {
  let d = 1;
  let e = cb;
  if (cs > 0.5) {
    e = 1;
    d = cb > 0.25 ? Math.sqrt(cb) : ((16 * cb - 12) * cb + 4) * cb;
  }
  return cb - (1 - 2 * cs) * e * (d - cb);
};
const hardlightMode: BlendModeType = (cb, cs) => overlayMode(cs, cb);
const differenceMode: BlendModeType = (cb, cs) => Math.abs(cb - cs);
const exclusionMode: BlendModeType = (cb, cs) => cb + cs - 2 * cb * cs;
// 以下は W3C の仕様にはない Less 独自のモード
const averageMode: BlendModeType = (cb, cs) => (cb + cs) / 2;
const negationMode: BlendModeType = (cb, cs) => 1 - Math.abs(cb + cs - 1);

// W3C Compositing の計算式でアルファを含めて合成する
const blend = (
  mode: BlendModeType,
  c1: ColorType,
  c2: ColorType
): ColorType => {
  const ab = c1.a;
  const as = c2.a;
  const ar = as + ab * (1 - as);

  const [r, g, b] = (['r', 'g', 'b'] as const).map(key => {
    const cb = c1[key] / 255;
    const cs = c2[key] / 255;
    let cr = mode(cb, cs);
    if (ar) cr = (as * cs + ab * (cb - as * (cb + cs - cr))) / ar;
    return cr * 255;
  });
  return { r, g, b, a: ar };
};

// 内部用。丸めずに ColorType のまま返す
// tree-shaking で消せるよう、トップレベルで関数を呼んで作らずに関数式で定義する
export const multiplyColor: BlendColorType = (c1, c2) =>
  blend(multiplyMode, c1, c2);
export const screenColor: BlendColorType = (c1, c2) =>
  blend(screenMode, c1, c2);
export const overlayColor: BlendColorType = (c1, c2) =>
  blend(overlayMode, c1, c2);
export const softlightColor: BlendColorType = (c1, c2) =>
  blend(softlightMode, c1, c2);
export const hardlightColor: BlendColorType = (c1, c2) =>
  blend(hardlightMode, c1, c2);
export const differenceColor: BlendColorType = (c1, c2) =>
  blend(differenceMode, c1, c2);
export const exclusionColor: BlendColorType = (c1, c2) =>
  blend(exclusionMode, c1, c2);
export const averageColor: BlendColorType = (c1, c2) =>
  blend(averageMode, c1, c2);
export const negationColor: BlendColorType = (c1, c2) =>
  blend(negationMode, c1, c2);

// 内部用の関数を呼び、色を受け取って文字列を返す
const run = (fn: BlendColorType, color1: ColorInput, color2: ColorInput) =>
  formatColor(fn(parseColor(color1), parseColor(color2)));

export const multiply: BlendType = (color1, color2) =>
  run(multiplyColor, color1, color2);
export const screen: BlendType = (color1, color2) =>
  run(screenColor, color1, color2);
export const overlay: BlendType = (color1, color2) =>
  run(overlayColor, color1, color2);
export const softlight: BlendType = (color1, color2) =>
  run(softlightColor, color1, color2);
export const hardlight: BlendType = (color1, color2) =>
  run(hardlightColor, color1, color2);
export const difference: BlendType = (color1, color2) =>
  run(differenceColor, color1, color2);
export const exclusion: BlendType = (color1, color2) =>
  run(exclusionColor, color1, color2);
export const average: BlendType = (color1, color2) =>
  run(averageColor, color1, color2);
export const negation: BlendType = (color1, color2) =>
  run(negationColor, color1, color2);
