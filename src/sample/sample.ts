import { DOMAdaptor, TextAdaptor } from '../adaptor';
import { type BubbleFC, createRenderer, useCallback, useState } from '../core';
import { createElement } from '../core/createElement';
import { VStack, Text } from '../core/components';

const domAdaptor = new DOMAdaptor();
const domRenderer = createRenderer(domAdaptor);

const textAdaptor = new TextAdaptor();
const textRenderer = createRenderer(textAdaptor);

const SampleComponent = () =>
  new VStack(
    new Text('text').key('text1'),
    new Text('text2').key('text2'),
    new Text('text3').key('text3')
  )
    .key('root')
    .build();

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

  return new VStack(
    new Text(outerText),
    new Text('Event Component').key('event-text'),
    new VStack(...texts.map((text, index) => new Text(text).key(`event-text-${index}`))).key(
      'event-texts'
    )
  )
    .key('event-root')
    .onClick(handleClick)
    .build();
};

domRenderer.render(createElement(EventComponent as any, { outerText: 'text' }));
