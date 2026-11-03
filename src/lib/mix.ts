import { type AmountType, formatColor, parseColor, toAmount } from './color';

export type MixType = (
  color1: string,
  color2: string,
  weight?: AmountType
) => string;

// Less と同様に weight の省略時は 50 とする
const mix: MixType = (color1, color2, weight = 50) => {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  const p = toAmount(weight) / 100;
  const w = p * 2 - 1;
  // アルファの差を重みに反映する（Less / Sass と同じ計算式）
  const a = c1.a - c2.a;

  const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
  const w2 = 1 - w1;

  return formatColor({
    r: c1.r * w1 + c2.r * w2,
    g: c1.g * w1 + c2.g * w2,
    b: c1.b * w1 + c2.b * w2,
    a: c1.a * p + c2.a * (1 - p)
  });
};

export default mix;
