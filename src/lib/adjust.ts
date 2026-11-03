import {
  type AmountType,
  type ColorInput,
  type ColorType,
  clamp,
  formatColor,
  fromHSLA,
  parseColor,
  toAmount,
  toHSLA
} from './color.js';

// 'absolute' は amount をそのまま加減算し、'relative' は現在の値に対する割合で加減算する
export type MethodType = 'absolute' | 'relative';
export type AdjustType = (
  color: ColorInput,
  amount: AmountType,
  method?: MethodType
) => string;
type AdjustColorType = (
  c: ColorType,
  amount: AmountType,
  method?: MethodType
) => ColorType;

// HSLA の 1 成分を増減する（sign は増やすなら 1、減らすなら -1）
const adjust = (
  key: 's' | 'l' | 'a',
  sign: 1 | -1,
  c: ColorType,
  amount: AmountType,
  method: MethodType = 'absolute'
): ColorType => {
  const hsla = toHSLA(c);
  const delta = toAmount(amount) / 100;
  hsla[key] = clamp(
    hsla[key] + sign * (method === 'relative' ? hsla[key] * delta : delta)
  );
  return fromHSLA(hsla);
};

// 内部用。丸めずに ColorType のまま返す
// tree-shaking で消せるよう、トップレベルで関数を呼んで作らずに関数式で定義する
export const saturateColor: AdjustColorType = (c, amount, method) =>
  adjust('s', 1, c, amount, method);
export const desaturateColor: AdjustColorType = (c, amount, method) =>
  adjust('s', -1, c, amount, method);
export const lightenColor: AdjustColorType = (c, amount, method) =>
  adjust('l', 1, c, amount, method);
export const darkenColor: AdjustColorType = (c, amount, method) =>
  adjust('l', -1, c, amount, method);
export const fadeinColor: AdjustColorType = (c, amount, method) =>
  adjust('a', 1, c, amount, method);
export const fadeoutColor: AdjustColorType = (c, amount, method) =>
  adjust('a', -1, c, amount, method);
export const greyscaleColor = (c: ColorType) => desaturateColor(c, 100);
export const fadeColor = (c: ColorType, amount: AmountType): ColorType => {
  const hsla = toHSLA(c);
  hsla.a = clamp(toAmount(amount) / 100);
  return fromHSLA(hsla);
};

// 内部用の関数を呼び、色を受け取って文字列を返す
const run = (
  fn: AdjustColorType,
  color: ColorInput,
  amount: AmountType,
  method?: MethodType
) => formatColor(fn(parseColor(color), amount, method));

/* 彩度を上げる */
export const saturate: AdjustType = (color, amount, method) =>
  run(saturateColor, color, amount, method);
/* 彩度を下げる */
export const desaturate: AdjustType = (color, amount, method) =>
  run(desaturateColor, color, amount, method);
/* 明度を上げる */
export const lighten: AdjustType = (color, amount, method) =>
  run(lightenColor, color, amount, method);
/* 明度を下げる */
export const darken: AdjustType = (color, amount, method) =>
  run(darkenColor, color, amount, method);
/* 不透明度を上げる */
export const fadein: AdjustType = (color, amount, method) =>
  run(fadeinColor, color, amount, method);
/* 不透明度を下げる */
export const fadeout: AdjustType = (color, amount, method) =>
  run(fadeoutColor, color, amount, method);

/* 彩度を 0 にする */
export const greyscale = (color: ColorInput) =>
  formatColor(greyscaleColor(parseColor(color)));

/* 不透明度を amount（0〜100）に設定する */
export const fade = (color: ColorInput, amount: AmountType) =>
  formatColor(fadeColor(parseColor(color), amount));
