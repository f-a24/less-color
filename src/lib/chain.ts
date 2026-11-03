import {
  type AmountType,
  type ColorInput,
  type ColorType,
  formatColor,
  parseColor
} from './color.js';
import {
  type MethodType,
  darkenColor,
  desaturateColor,
  fadeColor,
  fadeinColor,
  fadeoutColor,
  greyscaleColor,
  lightenColor,
  saturateColor
} from './adjust.js';
import {
  averageColor,
  differenceColor,
  exclusionColor,
  hardlightColor,
  multiplyColor,
  negationColor,
  overlayColor,
  screenColor,
  softlightColor
} from './blend.js';
import * as channels from './channels.js';
import * as output from './output.js';
import { pickContrast } from './contrast.js';
import luma from './luma.js';
import { mixColor } from './mix.js';
import { shadeColor } from './shade.js';
import { spinColor } from './spin.js';
import { tintColor } from './tint.js';

/*
 * 関数をつなげて呼ぶための色オブジェクト
 * 途中結果を丸めずに小数のまま保持するので、Less で関数を入れ子にした場合と同じ結果になる
 * ColorType を満たすので、そのまま各関数に渡すこともできる
 */
export class Color implements ColorType {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  constructor(input: ColorInput) {
    const { r, g, b, a } = parseColor(input);
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  // 色の演算
  mix(other: ColorInput, weight?: AmountType) {
    return new Color(mixColor(this, parseColor(other), weight));
  }
  tint(amount: AmountType) {
    return new Color(tintColor(this, amount));
  }
  shade(amount: AmountType) {
    return new Color(shadeColor(this, amount));
  }
  spin(angle: number) {
    return new Color(spinColor(this, angle));
  }
  contrast(
    dark: ColorInput = '#000000',
    light: ColorInput = '#ffffff',
    threshold?: AmountType
  ) {
    return new Color(pickContrast(this, dark, light, threshold));
  }

  // HSL・アルファの操作
  saturate(amount: AmountType, method?: MethodType) {
    return new Color(saturateColor(this, amount, method));
  }
  desaturate(amount: AmountType, method?: MethodType) {
    return new Color(desaturateColor(this, amount, method));
  }
  lighten(amount: AmountType, method?: MethodType) {
    return new Color(lightenColor(this, amount, method));
  }
  darken(amount: AmountType, method?: MethodType) {
    return new Color(darkenColor(this, amount, method));
  }
  fadein(amount: AmountType, method?: MethodType) {
    return new Color(fadeinColor(this, amount, method));
  }
  fadeout(amount: AmountType, method?: MethodType) {
    return new Color(fadeoutColor(this, amount, method));
  }
  fade(amount: AmountType) {
    return new Color(fadeColor(this, amount));
  }
  greyscale() {
    return new Color(greyscaleColor(this));
  }

  // ブレンド（this を背景、other を前景として合成する）
  multiply(other: ColorInput) {
    return new Color(multiplyColor(this, parseColor(other)));
  }
  screen(other: ColorInput) {
    return new Color(screenColor(this, parseColor(other)));
  }
  overlay(other: ColorInput) {
    return new Color(overlayColor(this, parseColor(other)));
  }
  softlight(other: ColorInput) {
    return new Color(softlightColor(this, parseColor(other)));
  }
  hardlight(other: ColorInput) {
    return new Color(hardlightColor(this, parseColor(other)));
  }
  difference(other: ColorInput) {
    return new Color(differenceColor(this, parseColor(other)));
  }
  exclusion(other: ColorInput) {
    return new Color(exclusionColor(this, parseColor(other)));
  }
  average(other: ColorInput) {
    return new Color(averageColor(this, parseColor(other)));
  }
  negation(other: ColorInput) {
    return new Color(negationColor(this, parseColor(other)));
  }

  // 成分の取得
  hue() {
    return channels.hue(this);
  }
  saturation() {
    return channels.saturation(this);
  }
  lightness() {
    return channels.lightness(this);
  }
  red() {
    return channels.red(this);
  }
  green() {
    return channels.green(this);
  }
  blue() {
    return channels.blue(this);
  }
  alpha() {
    return channels.alpha(this);
  }
  luma() {
    return luma(this);
  }
  luminance() {
    return channels.luminance(this);
  }

  // 出力
  /* '#rrggbb' または 'rgba(r, g, b, a)' を返す（ここで初めて丸める） */
  toString() {
    return formatColor(this);
  }
  /* 丸めていない値をプレーンなオブジェクトで返す */
  toObject(): ColorType {
    return { r: this.r, g: this.g, b: this.b, a: this.a };
  }
  /* '#rrggbb' または '#rrggbbaa' を返す */
  toHex() {
    return output.toHex(this);
  }
  /* 0〜255 の整数に丸めた { r, g, b, a } を返す */
  toRgb() {
    return output.toRgb(this);
  }
  /* 'rgb(r, g, b)' または 'rgba(r, g, b, a)' を返す */
  toRgbString() {
    return output.toRgbString(this);
  }
  /* 丸めていない { h, s, l, a } を返す */
  toHsl() {
    return output.toHsl(this);
  }
  /* 'hsl(h, s%, l%)' または 'hsla(h, s%, l%, a)' を返す */
  toHslString() {
    return output.toHslString(this);
  }
}

/* 色オブジェクトを作る */
export const color = (input: ColorInput) => new Color(input);
