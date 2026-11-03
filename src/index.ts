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
export type { RGBType, HSLType } from './lib/convert';
export type { ContrastType } from './lib/contrast';
export type { LumaType } from './lib/luma';
export type { MixType } from './lib/mix';
export type { ShadeType } from './lib/shade';
export type { SpinType } from './lib/spin';
export type { TintType } from './lib/tint';

// 既存の利用者向けに従来のデフォルトエクスポートも残す
export default { contrast, convert, tint, shade, luma, spin, mix };
