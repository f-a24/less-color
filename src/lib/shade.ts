import type { AmountType } from './color';
import mix from './mix';

export type ShadeType = (
  color: string,
  amount: AmountType
) => ReturnType<typeof mix>;
const shade: ShadeType = (color, amount) => mix('#000000', color, amount);

export default shade;
