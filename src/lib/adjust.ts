import {
  type AmountType,
  type HSLAType,
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
  color: string,
  amount: AmountType,
  method?: MethodType
) => string;

// HSLA の 1 成分を増減する関数を作る（sign は増やすなら 1、減らすなら -1）
const adjuster =
  (key: 's' | 'l' | 'a', sign: 1 | -1): AdjustType =>
  (color, amount, method = 'absolute') => {
    const hsla: HSLAType = toHSLA(parseColor(color));
    const delta = toAmount(amount) / 100;
    hsla[key] = clamp(
      hsla[key] + sign * (method === 'relative' ? hsla[key] * delta : delta)
    );
    return formatColor(fromHSLA(hsla));
  };

/* 彩度を上げる */
export const saturate = adjuster('s', 1);
/* 彩度を下げる */
export const desaturate = adjuster('s', -1);
/* 明度を上げる */
export const lighten = adjuster('l', 1);
/* 明度を下げる */
export const darken = adjuster('l', -1);
/* 不透明度を上げる */
export const fadein = adjuster('a', 1);
/* 不透明度を下げる */
export const fadeout = adjuster('a', -1);

/* 彩度を 0 にする */
export const greyscale = (color: string) => desaturate(color, 100);

/* 不透明度を amount（0〜100）に設定する */
export const fade = (color: string, amount: AmountType) => {
  const hsla = toHSLA(parseColor(color));
  hsla.a = clamp(toAmount(amount) / 100);
  return formatColor(fromHSLA(hsla));
};
