import { Node as YogaNode } from 'yoga-layout';
import { IntermediateStyles } from './MiddleStyleTypes';
import { Container, Text as PixiText } from 'pixi.js';
import { Styles } from './StyleTypes';

/**
 * Interface for Bubble UI styling system.
 * Defines the contract for style management and application to Pixi.js components.
 * Handles parent-child relationships, style interpretation, and application to different component types.
 */
export interface IBubbleStyleApplier {
  /**
   * Gets or sets the parent style element in the style hierarchy.
   * Used for style inheritance and layout positioning.
   */
  get parent(): IBubbleStyleApplier | null;

  set parent(parent: IBubbleStyleApplier | null);

  /**
   * Gets the middle representation of styles used internally for style calculations.
   */
  get middleStyle(): IntermediateStyles;

  /**
   * Gets the Yoga layout node associated with this style.
   * Used for flexbox layout calculations.
   */
  get layout(): YogaNode;

  /**
   * Inserts a child style at the specified index.
   * Updates the parent-child relationship and layout hierarchy.
   * @param child - The child style to insert
   * @param index - The index at which to insert the child
   */
  insertChild(child: IBubbleStyleApplier, index: number): void;

  /**
   * Removes a child style from this style's children.
   * Updates the parent-child relationship and layout hierarchy.
   * @param child - The child style to remove
   */
  removeChild(child: IBubbleStyleApplier): void;

  /**
   * Interprets and applies a middle style to this style instance.
   * @param style - The middle style to interpret
   */
  interpretStyle(style: Styles): void;

  /**
   * Applies the current style to a Pixi.js text component.
   * @param pixiComponentType - The type of component ('text')
   * @param text - The Pixi.js text instance to style
   */
  applyStyle(pixiComponentType: 'text', text: PixiText): void;

  /**
   * Applies the current style to a Pixi.js container component.
   * @param pixiComponentType - The type of component ('container')
   * @param container - The Pixi.js container instance to style
   */
  applyStyle(pixiComponentType: 'container', container: Container): void;
}
