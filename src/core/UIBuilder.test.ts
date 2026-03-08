import { describe, it, expect } from 'vitest';
import { Element, Text, VStack, HStack } from './components';

describe('UIBuilder / Components', () => {
  it('should build a simple Text element with properties', () => {
    const builder = Text('Hello World!')
      .key('title-key')
      .style({ color: 0xff0000, fontSize: 16 })
      .prop('id', 'test-id');

    const vnode = builder.build();

    expect(vnode.type).toBe('Text');
    // createElement は string を PRIMITIVE な _text を持つ子 VNode に変換する想定
    expect(vnode.props.children).toHaveLength(1);
    expect(vnode.props.children![0].type).toBe('PRIMITIVE');
    expect(vnode.props.children![0]._text).toBe('Hello World!');

    expect(vnode._key).toBe('title-key');
    expect(vnode.props.style).toEqual({ color: 0xff0000, fontSize: 16 });
    expect(vnode.props.id).toBe('test-id');
  });

  it('should build a nested tree structure (VStack)', () => {
    const builder = VStack(Text('Child 1').key('c1'), Text('Child 2').key('c2')).key('root-vstack');

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
    const builder = Element('Button', 'Click Me').onClick(mockHandler);

    const vnode = builder.build();
    expect(vnode.props.onClick).toBe(mockHandler);
  });

  it('should correctly merge styles when calling style multiple times', () => {
    const builder = HStack()
      .style({ width: 100, height: 100 })
      .style({ height: 200, backgroundColor: 'red' });

    const vnode = builder.build();
    expect(vnode.props.style).toEqual({ width: 100, height: 200, backgroundColor: 'red' });
  });

  it('should ignore null/undefined children smoothly', () => {
    const condition = false;
    // conditionally include child elements - similar to how developers do conditional rendering
    const builder = VStack(
      Text('always'),
      condition ? Text('conditional-truethy') : null,
      undefined as any, // 意図的にundefinedを渡す
      Text('always2')
    );

    const vnode = builder.build();
    expect(vnode.props.children).toHaveLength(2); // nullとundefinedはフィルタされる想定（createElementの挙動依存）
    expect(vnode.props.children![0].props.children![0]._text).toBe('always');
    expect(vnode.props.children![1].props.children![0]._text).toBe('always2');
  });
});
