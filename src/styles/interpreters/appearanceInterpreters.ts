import { INTERMEDIATE_INHERIT, IntermediateStyles } from '../IntermediateStyleTypes';
import { AppearanceStyles, Styles } from '../StyleTypes';
import { colorDecoder, getStyleValue, reactivePercentableDecoder } from './utils';

type AppearanceInterpreters = {
  [K in keyof AppearanceStyles]: (
    value: Styles[K],
    intermediateStyles: IntermediateStyles
  ) => IntermediateStyles;
};

export const appearanceInterpreters: AppearanceInterpreters = {
  backgroundColor: (_value, intermediateStyles) => {
    const value = getStyleValue('backgroundColor', _value);
    if (value === 'inherit') {
      return {
        ...intermediateStyles,
        backgroundColor: INTERMEDIATE_INHERIT,
        backgroundAlpha: INTERMEDIATE_INHERIT,
      };
    }
    const { color, alpha } = colorDecoder(value, 'backgroundColor');
    return {
      ...intermediateStyles,
      backgroundColor: color,
      backgroundAlpha: alpha,
    };
  },
  backgroundImage: (_value, intermediateStyles) => {
    const value = getStyleValue('backgroundImage', _value);
    if (value === 'inherit')
      return { ...intermediateStyles, backgroundImage: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, backgroundImage: value };
  },
  borderRadius: (_value, intermediateStyles) => {
    const value = getStyleValue('borderRadius', _value);
    if (value === 'inherit')
      return {
        ...intermediateStyles,
        borderRadiusTopLeft: INTERMEDIATE_INHERIT,
        borderRadiusTopRight: INTERMEDIATE_INHERIT,
        borderRadiusBottomRight: INTERMEDIATE_INHERIT,
        borderRadiusBottomLeft: INTERMEDIATE_INHERIT,
      };
    if (!Array.isArray(value)) {
      const reactivePercent = reactivePercentableDecoder(value, 'borderRadius');
      return {
        ...intermediateStyles,
        borderRadiusTopLeft: reactivePercent,
        borderRadiusTopRight: reactivePercent,
        borderRadiusBottomRight: reactivePercent,
        borderRadiusBottomLeft: reactivePercent,
      };
    }
    if (value.length === 2) {
      const reactivePercent = reactivePercentableDecoder(value[0], 'borderRadius');
      const reactivePercent2 = reactivePercentableDecoder(value[1], 'borderRadius');
      return {
        ...intermediateStyles,
        borderRadiusTopLeft: reactivePercent,
        borderRadiusTopRight: reactivePercent2,
        borderRadiusBottomRight: reactivePercent,
        borderRadiusBottomLeft: reactivePercent2,
      };
    }
    if (value.length === 3) {
      const reactivePercent = reactivePercentableDecoder(value[0], 'borderRadius');
      const reactivePercent2 = reactivePercentableDecoder(value[1], 'borderRadius');
      const reactivePercent3 = reactivePercentableDecoder(value[2], 'borderRadius');
      return {
        ...intermediateStyles,
        borderRadiusTopLeft: reactivePercent,
        borderRadiusTopRight: reactivePercent2,
        borderRadiusBottomRight: reactivePercent3,
        borderRadiusBottomLeft: reactivePercent2,
      };
    }
    if (value.length === 4) {
      return {
        ...intermediateStyles,
        borderRadiusTopLeft: reactivePercentableDecoder(value[0], 'borderRadius'),
        borderRadiusTopRight: reactivePercentableDecoder(value[1], 'borderRadius'),
        borderRadiusBottomRight: reactivePercentableDecoder(value[2], 'borderRadius'),
        borderRadiusBottomLeft: reactivePercentableDecoder(value[3], 'borderRadius'),
      };
    }
    throw new Error(`Invalid format of borderRadius value: ${value}`);
  },
  borderWidth: (_value, intermediateStyles) => {
    const value = getStyleValue('borderWidth', _value);
    if (value === 'inherit')
      return {
        ...intermediateStyles,
        borderWidthTop: INTERMEDIATE_INHERIT,
        borderWidthRight: INTERMEDIATE_INHERIT,
        borderWidthBottom: INTERMEDIATE_INHERIT,
        borderWidthLeft: INTERMEDIATE_INHERIT,
      };
    if (typeof value === 'number') {
      return {
        ...intermediateStyles,
        borderWidthTop: value,
        borderWidthRight: value,
        borderWidthBottom: value,
        borderWidthLeft: value,
      };
    }
    if (Array.isArray(value)) {
      if (value.length === 2) {
        return {
          ...intermediateStyles,
          borderWidthTop: value[0],
          borderWidthRight: value[1],
          borderWidthBottom: value[0],
          borderWidthLeft: value[1],
        };
      }
      if (value.length === 3) {
        return {
          ...intermediateStyles,
          borderWidthTop: value[0],
          borderWidthRight: value[1],
          borderWidthBottom: value[2],
          borderWidthLeft: value[1],
        };
      }
      if (value.length === 4) {
        return {
          ...intermediateStyles,
          borderWidthTop: value[0],
          borderWidthRight: value[1],
          borderWidthBottom: value[2],
          borderWidthLeft: value[3],
        };
      }
    }
    throw new Error(`Invalid format of borderRadius value: ${_value}`);
  },
  borderColor: (_value, intermediateStyles) => {
    const value = getStyleValue('borderColor', _value);
    if (value === 'inherit')
      return {
        ...intermediateStyles,
        borderColorTop: INTERMEDIATE_INHERIT,
        borderAlphaTop: INTERMEDIATE_INHERIT,
        borderColorRight: INTERMEDIATE_INHERIT,
        borderAlphaRight: INTERMEDIATE_INHERIT,
        borderColorBottom: INTERMEDIATE_INHERIT,
        borderAlphaBottom: INTERMEDIATE_INHERIT,
        borderColorLeft: INTERMEDIATE_INHERIT,
        borderAlphaLeft: INTERMEDIATE_INHERIT,
      };
    if (!Array.isArray(value)) {
      const { color, alpha } = colorDecoder(value, 'borderColor');
      return {
        ...intermediateStyles,
        borderColorTop: color,
        borderAlphaTop: alpha,
        borderColorRight: color,
        borderAlphaRight: alpha,
        borderColorBottom: color,
        borderAlphaBottom: alpha,
        borderColorLeft: color,
        borderAlphaLeft: alpha,
      };
    }
    const decodeds = value.map((color) => {
      const { color: c, alpha } = colorDecoder(color, 'borderColor');
      return { color: c, alpha };
    });
    if (decodeds.length === 2) {
      return {
        ...intermediateStyles,
        borderColorTop: decodeds[0].color,
        borderAlphaTop: decodeds[0].alpha,
        borderColorRight: decodeds[1].color,
        borderAlphaRight: decodeds[1].alpha,
        borderColorBottom: decodeds[0].color,
        borderAlphaBottom: decodeds[0].alpha,
        borderColorLeft: decodeds[1].color,
        borderAlphaLeft: decodeds[1].alpha,
      };
    }
    if (decodeds.length === 3) {
      return {
        ...intermediateStyles,
        borderColorTop: decodeds[0].color,
        borderAlphaTop: decodeds[0].alpha,
        borderColorRight: decodeds[1].color,
        borderAlphaRight: decodeds[1].alpha,
        borderColorBottom: decodeds[2].color,
        borderAlphaBottom: decodeds[2].alpha,
        borderColorLeft: decodeds[1].color,
        borderAlphaLeft: decodeds[1].alpha,
      };
    }
    if (decodeds.length === 4) {
      return {
        ...intermediateStyles,
        borderColorTop: decodeds[0].color,
        borderAlphaTop: decodeds[0].alpha,
        borderColorRight: decodeds[1].color,
        borderAlphaRight: decodeds[1].alpha,
        borderColorBottom: decodeds[2].color,
        borderAlphaBottom: decodeds[2].alpha,
        borderColorLeft: decodeds[3].color,
        borderAlphaLeft: decodeds[3].alpha,
      };
    }
    throw new Error(`Invalid format of borderColor value: ${_value}`);
  },
  opacity: (_value, intermediateStyles) => {
    const value = getStyleValue('opacity', _value);
    if (value === 'inherit') return { ...intermediateStyles, opacity: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, opacity: value };
  },
  visible: (_value, intermediateStyles) => {
    const value = getStyleValue('visible', _value);
    if (value === 'inherit') return { ...intermediateStyles, visible: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, visible: value };
  },
};
