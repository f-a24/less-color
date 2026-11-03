import {
  type AmountType,
  type ColorInput,
  type ColorType,
  formatColor,
  parseColor
} from './color';
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
} from './adjust';
import { type BlendModeName, blendColor } from './blend';
import * as channels from './channels';
import { pickContrast } from './contrast';
import luma from './luma';
import { mixColor } from './mix';
import { shadeColor } from './shade';
import { spinColor } from './spin';
import { tintColor } from './tint';

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
  private blend(name: BlendModeName, other: ColorInput) {
    return new Color(blendColor[name](this, parseColor(other)));
  }
  multiply(other: ColorInput) {
    return this.blend('multiply', other);
  }
  screen(other: ColorInput) {
    return this.blend('screen', other);
  }
  overlay(other: ColorInput) {
    return this.blend('overlay', other);
  }
  softlight(other: ColorInput) {
    return this.blend('softlight', other);
  }
  hardlight(other: ColorInput) {
    return this.blend('hardlight', other);
  }
  difference(other: ColorInput) {
    return this.blend('difference', other);
  }
  exclusion(other: ColorInput) {
    return this.blend('exclusion', other);
  }
  average(other: ColorInput) {
    return this.blend('average', other);
  }
  negation(other: ColorInput) {
    return this.blend('negation', other);
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
}

/* 色オブジェクトを作る */
export const color = (input: ColorInput) => new Color(input);
