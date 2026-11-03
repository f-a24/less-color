import {
  type AmountType,
  type ColorInput,
  type ColorType,
  formatColor,
  parseColor,
  toAmount
} from './color';

export type MixType = (
  color1: ColorInput,
  color2: ColorInput,
  weight?: AmountType
) => string;

// 内部用。丸めずに ColorType のまま返す（Less / Sass と同じ計算式）
export const mixColor = (
  c1: ColorType,
  c2: ColorType,
  weight: AmountType = 50
): ColorType => {
  const p = toAmount(weight) / 100;
  const w = p * 2 - 1;
  // アルファの差を重みに反映する
  const a = c1.a - c2.a;

  const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
  const w2 = 1 - w1;

  return {
    r: c1.r * w1 + c2.r * w2,
    g: c1.g * w1 + c2.g * w2,
    b: c1.b * w1 + c2.b * w2,
    a: c1.a * p + c2.a * (1 - p)
  };
};

// Less と同様に weight の省略時は 50 とする
const mix: MixType = (color1, color2, weight = 50) =>
  formatColor(mixColor(parseColor(color1), parseColor(color2), weight));

export default mix;
