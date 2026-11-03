import contrast from './lib/contrast';
import * as convert from './lib/convert';
import tint from './lib/tint';
import shade from './lib/shade';
import luma from './lib/luma';
import spin from './lib/spin';
import mix from './lib/mix';

// tree-shaking が効くように名前付きでもエクスポートする
export { contrast, convert, tint, shade, luma, spin, mix };
export { rgb2hex, hex2rgb, rgb2hsl, hsl2rgb } from './lib/convert';
export { parseColor, formatColor } from './lib/color';
export {
  saturate,
  desaturate,
  lighten,
  darken,
  fadein,
  fadeout,
  fade,
  greyscale
} from './lib/adjust';
export {
  hue,
  saturation,
  lightness,
  red,
  green,
  blue,
  alpha,
  luminance
} from './lib/channels';
export {
  multiply,
  screen,
  overlay,
  softlight,
  hardlight,
  difference,
  exclusion,
  average,
  negation
} from './lib/blend';
export type { RGBType, HSLType } from './lib/convert';
export type { ColorType, HSLAType, AmountType } from './lib/color';
export type { AdjustType, MethodType } from './lib/adjust';
export type { BlendType } from './lib/blend';
export type { ContrastType } from './lib/contrast';
export type { LumaType } from './lib/luma';
export type { MixType } from './lib/mix';
export type { ShadeType } from './lib/shade';
export type { SpinType } from './lib/spin';
export type { TintType } from './lib/tint';

// 既存の利用者向けに従来のデフォルトエクスポートも残す
// （tree-shaking を妨げないよう、新しい関数は名前付きエクスポートのみ）
export default { contrast, convert, tint, shade, luma, spin, mix };
