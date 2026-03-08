import { UIBuilder } from './UIBuilder';

export const Element = (type: string, ...children: (UIBuilder | string | number | boolean | null | undefined)[]) => {
  return new UIBuilder(type, children);
};

export const VStack = (...children: (UIBuilder | string | number | boolean | null | undefined)[]) => {
  // 後にpixi/yogaで適切なタイプマッピング等を行う前提
  return Element('VStack', ...children);
};

export const HStack = (...children: (UIBuilder | string | number | boolean | null | undefined)[]) => {
  return Element('HStack', ...children);
};

export const Text = (content: string | number) => {
  return Element('Text', content);
};
