import { Align, Display, FlexDirection, Justify, PositionType, Wrap } from 'yoga-layout';
import { IntermediateStyles } from './MiddleStyleTypes';
import { RequiredStyles } from './StyleTypes';

/**
 * Root style applied to the root element of the component tree
 * Contains concrete values for all properties that can be inherited
 */
export const rootStyle: RequiredStyles = {
  // Layout
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'stretch',
  alignSelf: 'auto',
  flexWrap: 'nowrap',
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  maxWidth: 0,
  maxHeight: 0,
  aspectRatio: 1,
  padding: 0,
  margin: 0,
  gap: 0,
  position: 'relative',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  // Appearance
  backgroundColor: 0xffffff,
  backgroundImage: '',
  borderRadius: 0,
  borderWidth: 0,
  borderColor: 0,
  opacity: 1,
  visible: true,

  // Text - concrete values for inheritable properties
  color: 0x000000,
  fontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  lineHeight: 1.2,
  letterSpacing: 0,
  wordWrap: true,
  wordWrapWidth: 0,

  // Pixi
  tint: 0xffffff,
  interactive: false,
  cursor: 'default',

  // Animation
  animationName: '',
  animationDuration: 300,
  animationDelay: 0,
};

/**
 * Default styles for components. These values will be used when a property is set to 'default'.
 * Some properties are set to 'inherit' to inherit values from parent components.
 */
export const defaultStyles: Exclude<RequiredStyles, 'default'> = {
  // Layout
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'stretch',
  alignSelf: 'auto',
  flexWrap: 'nowrap',
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  width: 'auto',
  height: 'auto',
  minWidth: 0,
  minHeight: 0,
  maxWidth: 0,
  maxHeight: 0,
  aspectRatio: 1,
  padding: 0,
  margin: 0,
  gap: 0,
  position: 'relative',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  // Appearance
  backgroundColor: 0,
  backgroundImage: '',
  borderRadius: 0,
  borderWidth: 0,
  borderColor: 0,
  opacity: 1,
  visible: true,

  // Text
  color: 'inherit',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  fontWeight: 'inherit',
  fontStyle: 'normal',
  textAlign: 'left',
  lineHeight: 'inherit',
  letterSpacing: 0,
  wordWrap: true,
  wordWrapWidth: 0,

  // Pixi
  tint: 0xffffff,
  interactive: false,
  cursor: 'default',

  // Animation
  animationName: '',
  animationDuration: 300,
  animationDelay: 0,
};

export const defaultMiddleStyle: IntermediateStyles = {
  // MiddleLayoutStyles
  width: 0,
  height: 0,
  minWidth: 0,
  minHeight: 0,
  maxWidth: 0,
  maxHeight: 0,
  aspectRatio: 1,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  display: Display.Flex,
  flexDirection: FlexDirection.Column,
  justifyContent: Justify.FlexStart,
  alignItems: Align.Stretch,
  alignContent: Align.Stretch,
  alignSelf: Align.Auto,
  flexWrap: Wrap.NoWrap,
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  columnGap: 0,
  rowGap: 0,
  position: PositionType.Relative,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  // MiddleAppearanceStyles
  opacity: 1,
  zIndex: 1,
  backgroundColor: 0xffffff,
  backgroundAlpha: 1,
  borderColorTop: 0x000000,
  borderColorRight: 0x000000,
  borderColorBottom: 0x000000,
  borderColorLeft: 0x000000,
  borderWidthTop: 1,
  borderWidthRight: 1,
  borderWidthBottom: 1,
  borderWidthLeft: 1,
  borderAlphaTop: 1,
  borderAlphaRight: 1,
  borderAlphaBottom: 1,
  borderAlphaLeft: 1,
  borderRadiusTopLeft: 0,
  borderRadiusTopRight: 0,
  borderRadiusBottomRight: 0,
  borderRadiusBottomLeft: 0,
  // MiddleTextStyles
  textColor: 0x000000,
  fontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 400,
  fontStyle: 0,
  align: 0,
  lineHeight: 1.2,
  letterSpacing: 0,
  wordWrap: true,
  wordWrapWidth: 0,
  // MiddlePixiStyles
  tint: 0xffffff,
  blendMode: 0,
  pivot: { x: 0, y: 0 },
  mask: null,
  cursor: 'default',
  // MiddleAnimationStyles
  animationSpeed: 1,
  animationLoop: false,
  animationDuration: 300,
  animationEase: 'linear',
  animationDelay: 0,
};
