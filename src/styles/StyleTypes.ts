/**
 * Reserved values for style properties
 */
export type ReservedValue = 'default' | 'inherit';

export type Percentable = number | `${number}%`;

type QuadValue<T> = T | [T, T] | [T, T, T] | [T, T, T, T];

type DoubleValue<T> = T | [T, T];

export type ColorFormat =
  | number
  | `#${string}`
  | `rgb(${number}, ${number}, ${number})`
  | `rgba(${number}, ${number}, ${number}, ${number})`;

export type WithReservedValue<T extends Record<string | number | symbol, unknown>> = {
  [K in keyof T]: T[K] | ReservedValue;
};

/**
 * Layout (Flexbox-like) style properties
 */
export type LayoutStyles = {
  display: 'flex' | 'none';

  flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems:
    | 'auto'
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'baseline'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignContent:
    | 'auto'
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'baseline'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignSelf:
    | 'auto'
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'baseline'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexGrow: number;
  flexShrink: number;
  flexBasis: number | 'auto' | `${number}%`;

  width: Percentable | 'auto';
  height: Percentable | 'auto';
  minWidth: Percentable;
  minHeight: Percentable;
  maxWidth: Percentable;
  maxHeight: Percentable;
  aspectRatio: number;

  padding: QuadValue<Percentable>;
  margin: QuadValue<Percentable>;
  gap: DoubleValue<Percentable>;

  position: 'relative' | 'absolute';
  top: Percentable;
  right: Percentable;
  bottom: Percentable;
  left: Percentable;
};

/**
 * Appearance style properties
 */
export type AppearanceStyles = {
  backgroundColor: ColorFormat;
  backgroundImage: string;
  borderRadius: QuadValue<Percentable>;
  borderWidth: QuadValue<number>;
  borderColor: QuadValue<ColorFormat>;
  opacity: number;
  visible: boolean;
};

/**
 * Text style properties
 */
export type TextStyles = {
  color: ColorFormat;
  fontSize: number;
  fontFamily: string | string[];
  fontWeight:
    | 'normal'
    | 'bold'
    | 'bolder'
    | 'lighter'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  fontStyle: 'normal' | 'italic' | 'oblique';
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  textBaseline: 'alphabetic' | 'top' | 'hanging' | 'middle' | 'ideographic' | 'bottom';
  wordWrap: boolean;
  wordWrapWidth: number;
};

/**
 * Pixi.js specific style properties
 */
export type PixiStyles = {
  tint: ColorFormat;
  cursor: string;
};

/**
 * Animation style properties
 */
export type AnimationStyles = {
  animationName: string;
  animationDuration: number;
  animationDelay: number;
};

/**
 * Combined style with all categories
 */
export type RequiredStyles = WithReservedValue<
  LayoutStyles & AppearanceStyles & TextStyles & PixiStyles & AnimationStyles
>;

export type Styles = Partial<RequiredStyles>;
