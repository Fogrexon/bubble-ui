import { Container, Text as PixiText } from 'pixi.js';
import { IntermediateStyles } from './MiddleStyleTypes';
import Yoga, { Node as YogaNode } from 'yoga-layout';
import { Styles } from './StyleTypes';
import { defaultMiddleStyle } from './utils';
import { IBubbleStyleApplier } from './IBubbleStyleApplier';

/**
 * Implementation of the IBubbleStyle interface.
 * Manages styling and layout for Bubble UI components using Yoga layout and Pixi.js rendering.
 */
export class BubbleStyleApplier implements IBubbleStyleApplier {
  /** Child styles managed by this style instance */
  private _children: IBubbleStyleApplier[] = [];

  /** Internal storage for the middle style representation */
  private _middleStyle: IntermediateStyles;

  /** Yoga layout node for flexbox calculations */
  private _layout: YogaNode;

  /** Previous style state for optimization and comparison */
  private _previousStyle: Styles | null = null;

  /** @inheritdoc */
  public parent: IBubbleStyleApplier | null = null;

  /** @inheritdoc */
  public get middleStyle(): IntermediateStyles {
    return this._middleStyle;
  }

  /** @inheritdoc */
  public get layout(): YogaNode {
    return this._layout;
  }

  /**
   * Creates a new BubbleStyle instance.
   * Initializes the Yoga layout node and default middle style.
   */
  constructor() {
    this._layout = Yoga.Node.create();
    this._middleStyle = defaultMiddleStyle;
  }

  /** @inheritdoc */
  public insertChild(child: IBubbleStyleApplier, index: number): void {
    if (index < 0 || index > this._children.length) {
      throw new Error('Index out of bounds');
    }
    child.parent = this;
    this._children.splice(index, 0, child);
    this._layout.insertChild(child.layout, index);
  }

  /** @inheritdoc */
  public removeChild(child: IBubbleStyleApplier): void {
    const index = this._children.indexOf(child);
    if (index === -1) {
      throw new Error('Child not found');
    }
    child.parent = null;
    this._children.splice(index, 1);
    this._layout.removeChild(child.layout);
  }

  /** @inheritdoc */
  interpretStyle(style: Styles): void {
    throw new Error('Method not implemented.');
  }

  /** @inheritdoc */
  applyStyle(pixiComponentType: 'text', text: PixiText): void;
  /** @inheritdoc */
  applyStyle(pixiComponentType: 'container', container: Container): void;
  applyStyle(pixiComponentType: unknown, container: unknown): void {
    throw new Error('Method not implemented.');
  }
}
