import { describe, it, expect } from 'vitest';
import { Element, Text, VStack, HStack } from './components';
import { Component } from './Component';
import { UIBuilder } from './UIBuilder';

describe('UIBuilder / Components', () => {
  it('should build a simple Text element with properties', () => {
    const builder = new Text('Hello World!')
      .key('title-key')
      .style({ color: 0xff0000, fontSize: 16 });

    const vnode = builder.build();

    expect(vnode.type).toBe('Text');
    expect(vnode.props.children).toHaveLength(1);
    expect(vnode.props.children![0].type).toBe('PRIMITIVE');
    expect(vnode.props.children![0]._text).toBe('Hello World!');
    expect(vnode._key).toBe('title-key');
    expect(vnode.props.style).toEqual({ color: 0xff0000, fontSize: 16 });
  });

  it('should build a nested tree structure (VStack)', () => {
    const builder = new VStack(new Text('Child 1').key('c1'), new Text('Child 2').key('c2')).key(
      'root-vstack'
    );

    const vnode = builder.build();

    expect(vnode.type).toBe('VStack');
    expect(vnode._key).toBe('root-vstack');
    expect(vnode.props.children).toHaveLength(2);
    expect(vnode.props.children![0].type).toBe('Text');
    expect(vnode.props.children![0]._key).toBe('c1');
    expect(vnode.props.children![1].type).toBe('Text');
    expect(vnode.props.children![1]._key).toBe('c2');
  });

  it('should handle onClick event handler', () => {
    const mockHandler = () => { };
    const builder = new Element('Button', 'Click Me').onClick(mockHandler);

    const vnode = builder.build();
    expect(vnode.props.onClick).toBe(mockHandler);
  });

  it('should correctly merge styles when calling style multiple times', () => {
    const builder = new HStack()
      .style({ width: 100, height: 100 })
      .style({ height: 200, backgroundColor: 'red' });

    const vnode = builder.build();
    expect(vnode.props.style).toEqual({ width: 100, height: 200, backgroundColor: 'red' });
  });

  it('should ignore null/undefined children smoothly', () => {
    const condition = false;
    const builder = new VStack(
      new Text('always'),
      condition ? new Text('conditional-truthy') : null,
      undefined as any,
      new Text('always2')
    );

    const vnode = builder.build();
    expect(vnode.props.children).toHaveLength(2);
    expect(vnode.props.children![0].props.children![0]._text).toBe('always');
    expect(vnode.props.children![1].props.children![0]._text).toBe('always2');
  });

  it('should build a custom Component inside a UIBuilder tree without pre-resolving', () => {
    type LabelProps = { text: string; subtitle: string };

    class LabelCard extends Component<LabelProps> {
      body(): UIBuilder {
        return new VStack(
          new Text(this.props.text).key('label-title'),
          new Text(this.props.subtitle).key('label-sub')
        ).key('label-card');
      }
    }

    const vnode = new VStack(new LabelCard({ text: 'Hello', subtitle: 'World' }))
      .key('root')
      .build();

    // The root VStack should have one child: the LabelCard class (as VNode type)
    expect(vnode.type).toBe('VStack');
    expect(vnode.props.children).toHaveLength(1);

    const cardVNode = vnode.props.children![0];
    expect(cardVNode.type).toBe(LabelCard);
    expect(cardVNode.props.text).toBe('Hello');
    expect(cardVNode.props.subtitle).toBe('World');
  });
});
