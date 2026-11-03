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
} from './color';

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

// HSLA の 1 成分を増減する関数を作る（sign は増やすなら 1、減らすなら -1）
const adjuster =
  (key: 's' | 'l' | 'a', sign: 1 | -1): AdjustColorType =>
  (c, amount, method = 'absolute') => {
    const hsla = toHSLA(c);
    const delta = toAmount(amount) / 100;
    hsla[key] = clamp(
      hsla[key] + sign * (method === 'relative' ? hsla[key] * delta : delta)
    );
    return fromHSLA(hsla);
  };

// 内部用。丸めずに ColorType のまま返す
export const saturateColor = adjuster('s', 1);
export const desaturateColor = adjuster('s', -1);
export const lightenColor = adjuster('l', 1);
export const darkenColor = adjuster('l', -1);
export const fadeinColor = adjuster('a', 1);
export const fadeoutColor = adjuster('a', -1);
export const greyscaleColor = (c: ColorType) => desaturateColor(c, 100);
export const fadeColor = (c: ColorType, amount: AmountType): ColorType => {
  const hsla = toHSLA(c);
  hsla.a = clamp(toAmount(amount) / 100);
  return fromHSLA(hsla);
};

// 内部用の関数を、色を受け取って文字列を返す公開用の関数にする
const publish =
  (fn: AdjustColorType): AdjustType =>
  (color, amount, method) =>
    formatColor(fn(parseColor(color), amount, method));

/* 彩度を上げる */
export const saturate = publish(saturateColor);
/* 彩度を下げる */
export const desaturate = publish(desaturateColor);
/* 明度を上げる */
export const lighten = publish(lightenColor);
/* 明度を下げる */
export const darken = publish(darkenColor);
/* 不透明度を上げる */
export const fadein = publish(fadeinColor);
/* 不透明度を下げる */
export const fadeout = publish(fadeoutColor);

/* 彩度を 0 にする */
export const greyscale = (color: ColorInput) =>
  formatColor(greyscaleColor(parseColor(color)));

/* 不透明度を amount（0〜100）に設定する */
export const fade = (color: ColorInput, amount: AmountType) =>
  formatColor(fadeColor(parseColor(color), amount));
