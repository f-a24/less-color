import mix from './mix';

export type TintType = (
  color: string,
  amount: number
) => ReturnType<typeof mix>;
const tint: TintType = (color, amount) => mix('#ffffff', color, amount);

export default tint;
