import {
  type AmountType,
  parseColor,
  relativeLuminance,
  toRatio
} from './color';

export type ContrastType = (
  color: string,
  dark?: string,
  light?: string,
  threshold?: AmountType
) => string;

// Less と同様に、比較にはアルファを考慮しない輝度を使う
const lumaOf = (color: string) => relativeLuminance(parseColor(color));

const contrast: ContrastType = (
  color,
  dark = '#000000',
  light = '#ffffff',
  threshold = 0.43
) => {
  // dark の方が明るい場合は入れ替える
  const [d, l] = lumaOf(dark) > lumaOf(light) ? [light, dark] : [dark, light];
  return lumaOf(color) < toRatio(threshold) ? l : d;
};

export default contrast;
