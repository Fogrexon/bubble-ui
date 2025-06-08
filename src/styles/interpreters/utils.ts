import { ReactiveParsentable } from '../MiddleStyleTypes';
import { ColorFormat, Percentable, RequiredStyles, Styles } from '../StyleTypes';
import { defaultStyles } from '../utils';

export const getStyleValue = <T extends keyof RequiredStyles>(
  key: T,
  value: Styles[T]
): Exclude<RequiredStyles[T], 'default'> => {
  // Using `as` to resolve type errors
  if (!value || value === 'default')
    return defaultStyles[key] as Exclude<RequiredStyles[T], 'default'>;
  return value as Exclude<RequiredStyles[T], 'default'>;
};

export const colorDecoder = (
  color: ColorFormat,
  valueKey: string
): { color: number; alpha: number } => {
  if (typeof color === 'number') {
    return { color, alpha: 1 };
  } else if (color.startsWith('#')) {
    return { color: parseInt(color.slice(1), 16), alpha: 1 };
  } else if (color.startsWith('rgb')) {
    const rgb = color.match(/\d+/g);
    if (rgb) {
      return {
        color: (parseInt(rgb[0]) << 16) | (parseInt(rgb[1]) << 8) | parseInt(rgb[2]),
        alpha: 1,
      };
    }
  } else if (color.startsWith('rgba')) {
    const rgba = color.match(/\d+(\.\d+)?/g);
    if (rgba) {
      return {
        color: (parseInt(rgba[0]) << 16) | (parseInt(rgba[1]) << 8) | parseInt(rgba[2]),
        alpha: parseFloat(rgba[3]),
      };
    }
  }
  throw new Error(`Invalid format of ${valueKey} value: ${color}`);
};

export const parsentableDecoder =
  (baseValue: number) =>
  (value: Percentable, valueKey: string): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.endsWith('%')) {
      const percentage = parseFloat(value.slice(0, -1)) / 100;
      return baseValue * percentage;
    }
    throw new Error(`Invalid format of ${valueKey} value: ${value}`);
  };

export const reactivePercentableDecoder = (
  value: Percentable,
  valueKey: string
): ReactiveParsentable => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentage = parseFloat(value.slice(0, -1)) / 100;
    return (baseValue: number) => baseValue * percentage;
  }
  throw new Error(`Invalid format of ${valueKey} value: ${value}`);
};
