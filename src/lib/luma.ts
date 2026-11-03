import { hex2rgb } from './convert';

export type LumaType = (color: string) => number;
const luma: LumaType = color => {
  const rgb = hex2rgb(color);
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;

  r = r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
  g = g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4;
  b = b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export default luma;
