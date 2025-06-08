import { Styles, TextStyles } from '../StyleTypes';
import { INTERMEDIATE_INHERIT, IntermediateStyles } from '../IntermediateStyleTypes';
import { colorDecoder, getStyleValue } from './utils';

type TextInterpreters = {
  [K in keyof TextStyles]: (
    value: Styles[K],
    intermediateStyles: IntermediateStyles
  ) => IntermediateStyles;
};

export const textInterpreters: TextInterpreters = {
  color: (_value, intermediateStyles) => {
    const value = getStyleValue('color', _value);
    if (value === 'inherit') {
      return {
        ...intermediateStyles,
        color: INTERMEDIATE_INHERIT,
        alpha: INTERMEDIATE_INHERIT,
      };
    }
    const { color, alpha } = colorDecoder(value, 'color');
    return {
      ...intermediateStyles,
      color,
      alpha,
    };
  },
  fontSize: (_value, intermediateStyles) => {
    const value = getStyleValue('fontSize', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, fontSize: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, fontSize: value };
  },
  fontFamily: (_value, intermediateStyles) => {
    const value = getStyleValue('fontFamily', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, fontFamily: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, fontFamily: value };
  },
  fontWeight: (_value, intermediateStyles) => {
    const value = getStyleValue('fontWeight', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, fontWeight: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, fontWeight: value };
  },
  fontStyle: (_value, intermediateStyles) => {
    const value = getStyleValue('fontStyle', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, fontStyle: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, fontStyle: value };
  },
  textAlign: (_value, intermediateStyles) => {
    const value = getStyleValue('textAlign', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, textAlign: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, textAlign: value };
  },
  lineHeight: (_value, intermediateStyles) => {
    const value = getStyleValue('lineHeight', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, lineHeight: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, lineHeight: value };
  },
  letterSpacing: (_value, intermediateStyles) => {
    const value = getStyleValue('letterSpacing', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, letterSpacing: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, letterSpacing: value };
  },
  textBaseline: (_value, intermediateStyles) => {
    const value = getStyleValue('textBaseline', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, textBaseline: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, textBaseline: value };
  },
  wordWrap: (_value, intermediateStyles) => {
    const value = getStyleValue('wordWrap', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, wordWrap: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, wordWrap: value };
  },
  wordWrapWidth: (_value, intermediateStyles) => {
    const value = getStyleValue('wordWrapWidth', _value);
    if (value === 'inherit') {
      return { ...intermediateStyles, wordWrapWidth: INTERMEDIATE_INHERIT };
    }
    return { ...intermediateStyles, wordWrapWidth: value };
  },
};
