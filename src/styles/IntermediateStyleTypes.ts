import { Align, Display, FlexDirection, Justify, PositionType, Wrap } from 'yoga-layout';
import { Percentable } from './StyleTypes';

export type ReactivePercentable = number | ((baseValue: number) => number);

type ReservedValue = 'inherit';

type WithReservedValue<T extends Record<string | number | symbol, unknown>> = {
  [K in keyof T]: T[K] | ReservedValue;
};

export const INTERMEDIATE_INHERIT = 'inherit' as const;
export type IntermediateInherit = typeof INTERMEDIATE_INHERIT;

/**
 * Processed layout style properties for rendering
 * All values are resolved to concrete pixel values for rendering
 */
export type IntermediateLayoutStyles = {
  display: Display;

  flexDirection: FlexDirection;
  justifyContent: Justify;
  alignItems: Align;
  alignContent: Align;
  alignSelf: Align;
  flexWrap: Wrap;
  flexGrow: number | undefined;
  flexShrink: number | undefined;
  flexBasis: number | 'auto' | `${number}%` | undefined;

  width: Percentable | 'auto' | undefined;
  height: Percentable | 'auto' | undefined;
  minWidth: Percentable | undefined;
  minHeight: Percentable | undefined;
  maxWidth: Percentable | undefined;
  maxHeight: Percentable | undefined;
  aspectRatio: number | undefined;

  paddingTop: Percentable | undefined;
  paddingRight: Percentable | undefined;
  paddingBottom: Percentable | undefined;
  paddingLeft: Percentable | undefined;
  marginTop: Percentable | undefined;
  marginRight: Percentable | undefined;
  marginBottom: Percentable | undefined;
  marginLeft: Percentable | undefined;

  rowGap: Percentable | undefined;
  columnGap: Percentable | undefined;

  position: PositionType;
  top: Percentable | undefined;
  right: Percentable | undefined;
  bottom: Percentable | undefined;
  left: Percentable | undefined;
};

/**
 * Processed appearance style properties for rendering
 */
export type IntermediateAppearanceStyles = {
  backgroundColor: number;
  backgroundAlpha: number;
  backgroundImage: string | undefined;
  borderRadiusTopLeft: ReactivePercentable;
  borderRadiusTopRight: ReactivePercentable;
  borderRadiusBottomRight: ReactivePercentable;
  borderRadiusBottomLeft: ReactivePercentable;
  borderWidthTop: number;
  borderWidthRight: number;
  borderWidthBottom: number;
  borderWidthLeft: number;
  borderColorTop: number;
  borderColorRight: number;
  borderColorBottom: number;
  borderColorLeft: number;
  borderAlphaTop: number;
  borderAlphaRight: number;
  borderAlphaBottom: number;
  borderAlphaLeft: number;

  opacity: number;
  visible: boolean;
};

/**
 * Processed text style properties for rendering
 */
export type IntermediateTextStyles = {
  textColor: number;
  textAlpha: number;
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
 * Processed Pixi.js specific style properties
 */
export type IntermediatePixiStyles = {
  tint: number;
  blendMode: number;
  pivot: { x: number; y: number };
  mask: any;

  cursor: string;
};

/**
 * Processed animation style properties
 */
export type IntermediateAnimationStyles = {
  animationSpeed: number;
  animationLoop: boolean;

  animationDuration: number;
  animationEase: string;
  animationDelay: number;
};

/**
 * Combined middle style with all processed categories
 */
export type RequiredIntermediateStyles = WithReservedValue<
  IntermediateLayoutStyles &
    IntermediateAppearanceStyles &
    IntermediateTextStyles &
    IntermediatePixiStyles &
    IntermediateAnimationStyles
>;

export type IntermediateStyles = Partial<RequiredIntermediateStyles>;
