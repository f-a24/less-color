import mix from './mix';

export type ShadeType = (
  color: string,
  amount: number
) => ReturnType<typeof mix>;
const shade: ShadeType = (color, amount) => mix('#000000', color, amount);

export default shade;
