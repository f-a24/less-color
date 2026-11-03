import { rgb2hex, hex2rgb, rgb2hsl, hsl2rgb } from './convert';

export type SpinType = (
  color: string,
  angle: number
) => ReturnType<typeof rgb2hex>;
const spin: SpinType = (color, angle) => {
  const hsl = rgb2hsl(hex2rgb(color));
  const hue = (hsl[0] + angle) % 360;
  hsl[0] = hue < 0 ? 360 + hue : hue;
  return rgb2hex(hsl2rgb(hsl));
};

export default spin;
