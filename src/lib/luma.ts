import { type ColorInput, parseColor, relativeLuminance } from './color';

export type LumaType = (color: ColorInput) => number;
// Less と同様にアルファを掛けた値を返す（0〜1）
const luma: LumaType = color => {
  const c = parseColor(color);
  return relativeLuminance(c) * c.a;
};
export default luma;
