# Quickstart Guide

This guide will help you quickly get started with Bubble UI.

## Installation

To install Bubble UI in your project, use npm or yarn:

```bash
npm install bubble-ui
# or
yarn add bubble-ui
```

## Basic Usage

Here's a simple example of how to use Bubble UI to create and render an element:

```typescript
import { createRenderer, createElement } from 'bubble-ui';
import { TextAdaptor } from 'bubble-ui/adaptor';

// 1. Create a renderer with a specific adaptor
const textAdaptor = new TextAdaptor();
const renderer = createRenderer(textAdaptor);

// 2. Define your UI component using createElement
const MyComponent = () =>
  createElement('element', { key: 'root' },
    createElement('text', { key: 'hello' }, 'Hello, Bubble UI!'),
  );

// 3. Render your component
renderer.render(createElement(MyComponent, null));

// The 'textAdaptor' will now contain the rendered output based on its implementation.
// For TextAdaptor, this might involve printing to console or manipulating a text buffer.
console.log(textAdaptor.getOutput());
```

## Further Steps

*   Explore the [API Documentation](./typedoc-api/index.md) for detailed information on available functions and components.
*   Refer to the [Configuration Details](./config-details.md) for advanced customization.