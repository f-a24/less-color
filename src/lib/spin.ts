import {
  type ColorInput,
  type ColorType,
  formatColor,
  fromHSLA,
  parseColor,
  toFinite,
  toHSLA
} from './color.js';

export type SpinType = (color: ColorInput, angle: number) => string;

// 内部用。丸めずに ColorType のまま返す
export const spinColor = (c: ColorType, angle: number): ColorType => {
  const hsla = toHSLA(c);
  const hue = (hsla.h + toFinite(angle, 'angle')) % 360;
  hsla.h = hue < 0 ? 360 + hue : hue;
  return fromHSLA(hsla);
};

const spin: SpinType = (color, angle) =>
  formatColor(spinColor(parseColor(color), angle));

export default spin;
