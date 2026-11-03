import type { AmountType, ColorInput, ColorType } from './color.js';
import mix, { mixColor } from './mix.js';

export type TintType = (
  color: ColorInput,
  amount: AmountType
) => ReturnType<typeof mix>;

const white: ColorType = { r: 255, g: 255, b: 255, a: 1 };

// 内部用。丸めずに ColorType のまま返す
export const tintColor = (c: ColorType, amount: AmountType) =>
  mixColor(white, c, amount);

const tint: TintType = (color, amount) => mix(white, color, amount);

export default tint;
