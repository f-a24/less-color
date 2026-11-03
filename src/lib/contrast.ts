import luma from './luma';

export type ContrastType = (
  color: string,
  dark?: string,
  light?: string,
  threshold?: number
) => string;

const contrast: ContrastType = (
  color,
  dark = '#000000',
  light = '#ffffff',
  threshold = 0.43
) => {
  // dark の方が明るい場合は入れ替える
  const [d, l] = luma(dark) > luma(light) ? [light, dark] : [dark, light];
  return luma(color) < threshold ? l : d;
};

export default contrast;
