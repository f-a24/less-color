import type { AmountType, ColorInput, ColorType } from './color';
import mix, { mixColor } from './mix';

export type ShadeType = (
  color: ColorInput,
  amount: AmountType
) => ReturnType<typeof mix>;

const black: ColorType = { r: 0, g: 0, b: 0, a: 1 };

// 内部用。丸めずに ColorType のまま返す
export const shadeColor = (c: ColorType, amount: AmountType) =>
  mixColor(black, c, amount);

const shade: ShadeType = (color, amount) => mix(black, color, amount);

export default shade;
