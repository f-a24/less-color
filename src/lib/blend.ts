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

const modes = {
  multiply: multiplyMode,
  screen: screenMode,
  overlay: overlayMode,
  softlight: (cb, cs) => {
    let d = 1;
    let e = cb;
    if (cs > 0.5) {
      e = 1;
      d = cb > 0.25 ? Math.sqrt(cb) : ((16 * cb - 12) * cb + 4) * cb;
    }
    return cb - (1 - 2 * cs) * e * (d - cb);
  },
  hardlight: (cb, cs) => overlayMode(cs, cb),
  difference: (cb, cs) => Math.abs(cb - cs),
  exclusion: (cb, cs) => cb + cs - 2 * cb * cs,
  // 以下は W3C の仕様にはない Less 独自のモード
  average: (cb, cs) => (cb + cs) / 2,
  negation: (cb, cs) => 1 - Math.abs(cb + cs - 1)
} satisfies Record<string, BlendModeType>;

export type BlendModeName = keyof typeof modes;

// W3C Compositing の計算式でアルファを含めて合成する
const blend =
  (mode: BlendModeType): BlendColorType =>
  (c1, c2) => {
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

// 内部用。モード名から、丸めずに ColorType のまま返す合成関数を引く
export const blendColor = Object.fromEntries(
  Object.entries(modes).map(([name, mode]) => [name, blend(mode)])
) as Record<BlendModeName, BlendColorType>;

const publish =
  (name: BlendModeName): BlendType =>
  (color1, color2) =>
    formatColor(blendColor[name](parseColor(color1), parseColor(color2)));

export const multiply = publish('multiply');
export const screen = publish('screen');
export const overlay = publish('overlay');
export const softlight = publish('softlight');
export const hardlight = publish('hardlight');
export const difference = publish('difference');
export const exclusion = publish('exclusion');
export const average = publish('average');
export const negation = publish('negation');
