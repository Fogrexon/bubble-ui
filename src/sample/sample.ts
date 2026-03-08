import { DOMAdaptor, TextAdaptor } from '../adaptor';
import { type BubbleFC, createRenderer, useCallback, useState } from '../core';
import { createElement } from '../core/createElement';
import { VStack, Text } from '../core/components';
import { Component, UIBuilder } from '../core/UIBuilder';

const domAdaptor = new DOMAdaptor();
const domRenderer = createRenderer(domAdaptor);

const textAdaptor = new TextAdaptor();
const textRenderer = createRenderer(textAdaptor);

// -- Example custom component --

type HeaderProps = { title: string };

class Header extends Component<HeaderProps> {
  body(): UIBuilder {
    return new VStack(new Text(this.props.title).key('header-title')).key('header-root');
  }
}

// -- Top-level sample using the new Component pattern --

const SampleComponent = () =>
  new VStack(new Header({ title: 'Sample App' }), new Text('Subtitle').key('sub'))
    .key('root')
    .build();

textRenderer.render(SampleComponent());

// -- Stateful event component --

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
