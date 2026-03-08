/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { DOMAdaptor, TextAdaptor } from '../adaptor';
import { createRenderer, Component, UIBuilder } from '../core';
import { createElement } from '../core/createElement';
import { VStack, Text } from '../core/components';

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

class SampleApp extends Component {
  body(): UIBuilder {
    return new VStack(new Header({ title: 'Sample App' }), new Text('Subtitle').key('sub')).key(
      'root'
    );
  }
}

textRenderer.render(createElement(SampleApp, {}));

// -- Stateful event component --

type EventComponentProps = {
  outerText: string;
};

type EventComponentState = {
  texts: string[];
};

class EventComponent extends Component<EventComponentProps, EventComponentState> {
  constructor(props: EventComponentProps) {
    super(props);
    this.state = {
      texts: ['Initial Text'],
    };
  }

  handleClick = () => {
    // eslint-disable-next-line no-console
    console.log('Element clicked');
    this.setState({
      texts: [...this.state.texts, `Text ${this.state.texts.length + 1}`],
    });
  };

  body(): UIBuilder {
    return new VStack(
      new Text(this.props.outerText),
      new Text('Event Component').key('event-text'),
      new VStack(
        ...this.state.texts.map((text, index) => new Text(text).key(`event-text-${index}`))
      ).key('event-texts')
    )
      .key('event-root')
      .onClick(this.handleClick);
  }
}

domRenderer.render(createElement(EventComponent, { outerText: 'text' }));
