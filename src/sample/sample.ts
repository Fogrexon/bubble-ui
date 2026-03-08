import { DOMAdaptor, TextAdaptor } from '../adaptor';
import { type BubbleFC, createRenderer, useCallback, useState, Text, VStack } from '../core';

const domAdaptor = new DOMAdaptor();
const domRenderer = createRenderer(domAdaptor);

const textAdaptor = new TextAdaptor();
const textRenderer = createRenderer(textAdaptor);

const SampleComponent = () => {
  return VStack(Text('text').key('text1'), Text('text2').key('text2'), Text('text3').key('text3'))
    .key('root')
    .build();
};

textRenderer.render(SampleComponent());

type EventComponentProps = {
  outerText: string;
};

const EventComponent: BubbleFC<EventComponentProps> = ({ outerText }) => {
  const [texts, setTexts] = useState<string[]>(['Initial Text']);
  const handleClick = useCallback(() => {
    console.log('Element clicked');
    setTexts((prev) => [...prev, `Text ${prev.length + 1}`]);
  });

  return VStack(
    Text(outerText),
    Text('Event Component').key('event-text'),
    VStack(...texts.map((text, index) => Text(text).key(`event-text-${index}`))).key('event-texts')
  )
    .key('event-root')
    .onClick(handleClick)
    .build();
};

// <EventComponent outerText="text" /> は、createElementを通してVNodeに変換されてRendererに渡されていました。
// JSXを通さない場合、以下のように手動でコンポーネント用のVNodeを構築して渡します。
import { createElement } from '../core/createElement';
domRenderer.render(createElement(EventComponent as any, { outerText: 'text' }));
