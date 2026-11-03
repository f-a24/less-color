import { hex2rgb, rgb2hex } from './convert';

export type MixType = (c1: string, c2: string, weight?: number) => string;

// Less と同様に weight の省略時は 50 とする
const mix: MixType = (c1, c2, weight = 50) => {
  const c1Arr = hex2rgb(c1);
  const c2Arr = hex2rgb(c2);
  const p = weight / 100;
  const w = p * 2 - 1;

  const w1 = (w + 1) / 2;
  const w2 = 1 - w1;

  return rgb2hex([
    c1Arr[0] * w1 + c2Arr[0] * w2,
    c1Arr[1] * w1 + c2Arr[1] * w2,
    c1Arr[2] * w1 + c2Arr[2] * w2
  ]);
};

export default mix;
