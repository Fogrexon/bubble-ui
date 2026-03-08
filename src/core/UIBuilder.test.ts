import { describe, it, expect } from 'vitest';
import { Element, Text, VStack, HStack, type UIElement } from './components';

describe('UIBuilder / Components', () => {
  it('should build a simple Text element with properties', () => {
    const builder = new Text('Hello World!')
      .key('title-key')
      .style({ color: 0xff0000, fontSize: 16 })
      .id('test-id');

    const vnode = builder.build();

    expect(vnode.type).toBe('Text');
    expect(vnode.props.children).toHaveLength(1);
    expect(vnode.props.children![0].type).toBe('PRIMITIVE');
    expect(vnode.props.children![0]._text).toBe('Hello World!');

    expect(vnode._key).toBe('title-key');
    expect(vnode.props.style).toEqual({ color: 0xff0000, fontSize: 16 });
    expect(vnode.props.id).toBe('test-id');
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
    const mockHandler = () => {};
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
      condition ? new Text('conditional-truethy') : null,
      undefined as any,
      new Text('always2')
    );

    const vnode = builder.build();
    expect(vnode.props.children).toHaveLength(2);
    expect(vnode.props.children![0].props.children![0]._text).toBe('always');
    expect(vnode.props.children![1].props.children![0]._text).toBe('always2');
  });

  it('should support dynamic prop methods (replaces .prop())', () => {
    // Cast to UIElement to use dynamic prop methods that are Proxy-based
    const builder = (new Text('content') as UIElement)
      .id('my-id')
      .className('my-class')
      .tabIndex(0);

    const vnode = builder.build();
    expect(vnode.props.id).toBe('my-id');
    expect(vnode.props.className).toBe('my-class');
    expect(vnode.props.tabIndex).toBe(0);
  });
});
