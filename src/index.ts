// tree-shaking が効くよう、すべて名前付きエクスポートにする
export { default as contrast } from './lib/contrast';
export { default as tint } from './lib/tint';
export { default as shade } from './lib/shade';
export { default as luma } from './lib/luma';
export { default as spin } from './lib/spin';
export { default as mix } from './lib/mix';
export {
  rgb2hex,
  hex2rgb,
  rgb2hsl,
  hsl2rgb,
  toRGB,
  toRGBValue
} from './lib/convert';
export { parseColor, formatColor } from './lib/color';
export {
  toHex,
  toRgb,
  toRgbString,
  toHsl,
  toHslString,
  isValidColor
} from './lib/output';
export { color, Color } from './lib/chain';
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
export type { RGBType, RGBValue, HSLType } from './lib/convert';
export type { ColorType, ColorInput, HSLAType, AmountType } from './lib/color';
export type { AdjustType, MethodType } from './lib/adjust';
export type { BlendType } from './lib/blend';
export type { ContrastType } from './lib/contrast';
export type { LumaType } from './lib/luma';
export type { MixType } from './lib/mix';
export type { ShadeType } from './lib/shade';
export type { SpinType } from './lib/spin';
export type { TintType } from './lib/tint';
