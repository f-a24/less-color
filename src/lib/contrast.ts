import {
  type AmountType,
  type ColorInput,
  formatColor,
  parseColor,
  relativeLuminance,
  toRatio
} from './color';

export type ContrastType = (
  color: ColorInput,
  dark?: ColorInput,
  light?: ColorInput,
  threshold?: AmountType
) => string;

// Less と同様に、比較にはアルファを考慮しない輝度を使う
const lumaOf = (color: ColorInput) => relativeLuminance(parseColor(color));

// 内部用。dark と light のうち選ばれた方を、渡された値のまま返す
export const pickContrast = <T extends ColorInput>(
  color: ColorInput,
  dark: T,
  light: T,
  threshold: AmountType = 0.43
): T => {
  // dark の方が明るい場合は入れ替える
  const [d, l]: [T, T] =
    lumaOf(dark) > lumaOf(light) ? [light, dark] : [dark, light];
  return lumaOf(color) < toRatio(threshold) ? l : d;
};

// 文字列が選ばれた場合は渡された文字列をそのまま返す
const contrast: ContrastType = (
  color,
  dark = '#000000',
  light = '#ffffff',
  threshold = 0.43
) => {
  const picked = pickContrast(color, dark, light, threshold);
  return typeof picked === 'string' ? picked : formatColor(parseColor(picked));
};

export default contrast;
