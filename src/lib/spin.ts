import { formatColor, fromHSLA, parseColor, toHSLA } from './color';

export type SpinType = (color: string, angle: number) => string;
const spin: SpinType = (color, angle) => {
  const hsla = toHSLA(parseColor(color));
  const hue = (hsla.h + angle) % 360;
  hsla.h = hue < 0 ? 360 + hue : hue;
  return formatColor(fromHSLA(hsla));
};

export default spin;
