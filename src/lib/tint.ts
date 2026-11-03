import type { AmountType } from './color';
import mix from './mix';

export type TintType = (
  color: string,
  amount: AmountType
) => ReturnType<typeof mix>;
const tint: TintType = (color, amount) => mix('#ffffff', color, amount);

export default tint;
