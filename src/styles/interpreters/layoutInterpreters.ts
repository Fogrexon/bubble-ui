import { Align, Display, FlexDirection, Justify, PositionType, Wrap } from 'yoga-layout';
import { LayoutStyles, Styles } from '../StyleTypes';
import { getStyleValue } from './utils';
import { INTERMEDIATE_INHERIT, IntermediateStyles } from '../IntermediateStyleTypes';

const displayTable = {
  flex: Display.Flex,
  none: Display.None,
} as const;

const flexDirectionTable = {
  row: FlexDirection.Row,
  column: FlexDirection.Column,
  'row-reverse': FlexDirection.RowReverse,
  'column-reverse': FlexDirection.ColumnReverse,
} as const;

const justifyContentTable = {
  'flex-start': Justify.FlexStart,
  'flex-end': Justify.FlexEnd,
  center: Justify.Center,
  'space-between': Justify.SpaceBetween,
  'space-around': Justify.SpaceAround,
  'space-evenly': Justify.SpaceEvenly,
} as const;

const alignTable = {
  auto: Align.Auto,
  'flex-start': Align.FlexStart,
  center: Align.Center,
  'flex-end': Align.FlexEnd,
  stretch: Align.Stretch,
  baseline: Align.Baseline,
  'space-between': Align.SpaceBetween,
  'space-around': Align.SpaceAround,
  'space-evenly': Align.SpaceEvenly,
} as const;

const flexWrapTable = {
  nowrap: Wrap.NoWrap,
  wrap: Wrap.Wrap,
  'wrap-reverse': Wrap.WrapReverse,
} as const;

const positionTable = {
  relative: PositionType.Relative,
  absolute: PositionType.Absolute,
} as const;

type LayoutInterpreters = {
  [K in keyof LayoutStyles]: (
    value: Styles[K],
    intermediateStyles: IntermediateStyles
  ) => IntermediateStyles;
};

export const layoutInterpreters: LayoutInterpreters = {
  display: (value, intermediateStyles) => {
    const display = getStyleValue('display', value);
    if (display === 'inherit') return { ...intermediateStyles, display: INTERMEDIATE_INHERIT };
    if (display in displayTable) return { ...intermediateStyles, display: displayTable[display] };
    throw new Error(`Invalid display value: ${display}`);
  },
  flexDirection: (value, intermediateStyles) => {
    const flexDirection = getStyleValue('flexDirection', value);
    if (flexDirection === 'inherit')
      return { ...intermediateStyles, flexDirection: INTERMEDIATE_INHERIT };
    if (flexDirection in flexDirectionTable)
      return {
        ...intermediateStyles,
        flexDirection: flexDirectionTable[flexDirection],
      };
    throw new Error(`Invalid flexDirection value: ${flexDirection}`);
  },
  justifyContent: (value, intermediateStyles) => {
    const justifyContent = getStyleValue('justifyContent', value);
    if (justifyContent === 'inherit')
      return { ...intermediateStyles, justifyContent: INTERMEDIATE_INHERIT };
    if (justifyContent in justifyContentTable)
      return {
        ...intermediateStyles,
        justifyContent: justifyContentTable[justifyContent],
      };
    throw new Error(`Invalid justifyContent value: ${justifyContent}`);
  },
  alignItems: (value, intermediateStyles) => {
    const alignItems = getStyleValue('alignItems', value);
    if (alignItems === 'inherit')
      return { ...intermediateStyles, alignItems: INTERMEDIATE_INHERIT };
    if (alignItems in alignTable)
      return { ...intermediateStyles, alignItems: alignTable[alignItems] };
    throw new Error(`Invalid alignItems value: ${alignItems}`);
  },
  alignContent: (value, intermediateStyles) => {
    const alignContent = getStyleValue('alignContent', value);
    if (alignContent === 'inherit')
      return { ...intermediateStyles, alignContent: INTERMEDIATE_INHERIT };
    if (alignContent in alignTable)
      return { ...intermediateStyles, alignContent: alignTable[alignContent] };
    throw new Error(`Invalid alignContent value: ${alignContent}`);
  },
  alignSelf: (value, intermediateStyles) => {
    const alignSelf = getStyleValue('alignSelf', value);
    if (alignSelf === 'inherit') return { ...intermediateStyles, alignSelf: INTERMEDIATE_INHERIT };
    if (alignSelf in alignTable) return { ...intermediateStyles, alignSelf: alignTable[alignSelf] };
    throw new Error(`Invalid alignSelf value: ${alignSelf}`);
  },
  flexWrap: (value, intermediateStyles) => {
    const flexWrap = getStyleValue('flexWrap', value);
    if (flexWrap === 'inherit') return { ...intermediateStyles, flexWrap: INTERMEDIATE_INHERIT };
    if (flexWrap in flexWrapTable)
      return { ...intermediateStyles, flexWrap: flexWrapTable[flexWrap] };
    throw new Error(`Invalid flexWrap value: ${flexWrap}`);
  },
  flexGrow: (value, intermediateStyles) => {
    const flexGrow = getStyleValue('flexGrow', value);
    if (flexGrow === 'inherit') return { ...intermediateStyles, flexGrow: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, flexGrow };
  },
  flexShrink: (value, intermediateStyles) => {
    const flexShrink = getStyleValue('flexShrink', value);
    if (flexShrink === 'inherit')
      return { ...intermediateStyles, flexShrink: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, flexShrink };
  },
  flexBasis: (value, intermediateStyles) => {
    const flexBasis = getStyleValue('flexBasis', value);
    if (flexBasis === 'inherit') return { ...intermediateStyles, flexBasis: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, flexBasis };
  },
  width: (value, intermediateStyles) => {
    const width = getStyleValue('width', value);
    if (width === 'inherit') return { ...intermediateStyles, width: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, width };
  },
  height: (value, intermediateStyles) => {
    const height = getStyleValue('height', value);
    if (height === 'inherit') return { ...intermediateStyles, height: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, height };
  },
  minWidth: (value, intermediateStyles) => {
    const minWidth = getStyleValue('minWidth', value);
    if (minWidth === 'inherit') return { ...intermediateStyles, minWidth: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, minWidth };
  },
  minHeight: (value, intermediateStyles) => {
    const minHeight = getStyleValue('minHeight', value);
    if (minHeight === 'inherit') return { ...intermediateStyles, minHeight: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, minHeight };
  },
  maxWidth: (value, intermediateStyles) => {
    const maxWidth = getStyleValue('maxWidth', value);
    if (maxWidth === 'inherit') return { ...intermediateStyles, maxWidth: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, maxWidth };
  },
  maxHeight: (value, intermediateStyles) => {
    const maxHeight = getStyleValue('maxHeight', value);
    if (maxHeight === 'inherit') return { ...intermediateStyles, maxHeight: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, maxHeight };
  },
  aspectRatio: (value, intermediateStyles) => {
    const aspectRatio = getStyleValue('aspectRatio', value);
    if (aspectRatio === 'inherit')
      return { ...intermediateStyles, aspectRatio: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, aspectRatio };
  },
  padding: (value, intermediateStyles) => {
    const padding = getStyleValue('padding', value);
    if (padding === 'inherit') {
      return {
        ...intermediateStyles,
        paddingTop: INTERMEDIATE_INHERIT,
        paddingRight: INTERMEDIATE_INHERIT,
        paddingBottom: INTERMEDIATE_INHERIT,
        paddingLeft: INTERMEDIATE_INHERIT,
      };
    }
    if (typeof padding === 'number') {
      return {
        ...intermediateStyles,
        paddingTop: padding,
        paddingRight: padding,
        paddingBottom: padding,
        paddingLeft: padding,
      };
    }
    if (Array.isArray(padding)) {
      if (padding.length === 2) {
        return {
          ...intermediateStyles,
          paddingTop: padding[0],
          paddingRight: padding[1],
          paddingBottom: padding[0],
          paddingLeft: padding[1],
        };
      }
      if (padding.length === 3) {
        return {
          ...intermediateStyles,
          paddingTop: padding[0],
          paddingRight: padding[1],
          paddingBottom: padding[2],
          paddingLeft: padding[1],
        };
      }
      if (padding.length === 4) {
        return {
          ...intermediateStyles,
          paddingTop: padding[0],
          paddingRight: padding[1],
          paddingBottom: padding[2],
          paddingLeft: padding[3],
        };
      }
    }
    throw new Error(`Invalid padding value: ${padding}`);
  },
  margin: (value, intermediateStyles) => {
    const margin = getStyleValue('margin', value);
    if (margin === 'inherit') {
      return {
        ...intermediateStyles,
        marginTop: INTERMEDIATE_INHERIT,
        marginRight: INTERMEDIATE_INHERIT,
        marginBottom: INTERMEDIATE_INHERIT,
        marginLeft: INTERMEDIATE_INHERIT,
      };
    }
    if (typeof margin === 'number') {
      return {
        ...intermediateStyles,
        marginTop: margin,
        marginRight: margin,
        marginBottom: margin,
        marginLeft: margin,
      };
    }
    if (Array.isArray(margin)) {
      if (margin.length === 2) {
        return {
          ...intermediateStyles,
          marginTop: margin[0],
          marginRight: margin[1],
          marginBottom: margin[0],
          marginLeft: margin[1],
        };
      }
      if (margin.length === 3) {
        return {
          ...intermediateStyles,
          marginTop: margin[0],
          marginRight: margin[1],
          marginBottom: margin[2],
          marginLeft: margin[1],
        };
      }
      if (margin.length === 4) {
        return {
          ...intermediateStyles,
          marginTop: margin[0],
          marginRight: margin[1],
          marginBottom: margin[2],
          marginLeft: margin[3],
        };
      }
    }
    throw new Error(`Invalid margin value: ${margin}`);
  },
  gap: (value, intermediateStyles) => {
    const gap = getStyleValue('gap', value);
    if (gap === 'inherit') {
      return {
        ...intermediateStyles,
        rowGap: INTERMEDIATE_INHERIT,
        columnGap: INTERMEDIATE_INHERIT,
      };
    }
    if (typeof gap === 'number') {
      return {
        ...intermediateStyles,
        rowGap: gap,
        columnGap: gap,
      };
    }
    if (Array.isArray(gap)) {
      if (gap.length === 2) {
        return {
          ...intermediateStyles,
          rowGap: gap[0],
          columnGap: gap[1],
        };
      }
    }
    throw new Error(`Invalid gap value: ${gap}`);
  },
  position: (value, intermediateStyles) => {
    const position = getStyleValue('position', value);
    if (position === 'inherit') return { ...intermediateStyles, position: INTERMEDIATE_INHERIT };
    if (position in positionTable)
      return { ...intermediateStyles, position: positionTable[position] };
    throw new Error(`Invalid position value: ${position}`);
  },
  top: (value, intermediateStyles) => {
    const top = getStyleValue('top', value);
    if (top === 'inherit') return { ...intermediateStyles, top: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, top };
  },
  right: (value, intermediateStyles) => {
    const right = getStyleValue('right', value);
    if (right === 'inherit') return { ...intermediateStyles, right: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, right };
  },
  bottom: (value, intermediateStyles) => {
    const bottom = getStyleValue('bottom', value);
    if (bottom === 'inherit') return { ...intermediateStyles, bottom: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, bottom };
  },
  left: (value, intermediateStyles) => {
    const left = getStyleValue('left', value);
    if (left === 'inherit') return { ...intermediateStyles, left: INTERMEDIATE_INHERIT };
    return { ...intermediateStyles, left };
  },
};
