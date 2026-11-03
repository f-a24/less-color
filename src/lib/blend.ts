import { formatColor, parseColor } from './color';

// cb は背景（color1）、cs は前景（color2）の 0〜1 の成分値
type BlendModeType = (cb: number, cs: number) => number;
export type BlendType = (color1: string, color2: string) => string;

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

// W3C Compositing の計算式でアルファを含めて合成する
const blend =
  (mode: BlendModeType): BlendType =>
  (color1, color2) => {
    const c1 = parseColor(color1);
    const c2 = parseColor(color2);
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
    return formatColor({ r, g, b, a: ar });
  };

export const multiply = blend(modes.multiply);
export const screen = blend(modes.screen);
export const overlay = blend(modes.overlay);
export const softlight = blend(modes.softlight);
export const hardlight = blend(modes.hardlight);
export const difference = blend(modes.difference);
export const exclusion = blend(modes.exclusion);
export const average = blend(modes.average);
export const negation = blend(modes.negation);
