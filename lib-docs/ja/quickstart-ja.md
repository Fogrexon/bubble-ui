# クイックスタートガイド

このガイドでは、Bubble UIを素早く使い始めるための手順を説明します。

## インストール

プロジェクトにBubble UIをインストールするには、npmまたはyarnを使用します。

```bash
npm install bubble-ui
# または
yarn add bubble-ui
```

## 基本的な使用方法

以下は、Bubble UIを使用して要素を作成し、レンダリングする簡単な例です。

```typescript
import { createRenderer, createElement } from 'bubble-ui';
import { TextAdaptor } from 'bubble-ui/adaptor';

// 1. 特定のアダプタでレンダラーを作成
const textAdaptor = new TextAdaptor();
const renderer = createRenderer(textAdaptor);

// 2. createElementを使用してUIコンポーネントを定義
const MyComponent = () =>
  createElement('element', { key: 'root' },
    createElement('text', { key: 'hello' }, 'Hello, Bubble UI!'),
  );

// 3. コンポーネントをレンダリング
renderer.render(createElement(MyComponent, null));

// 'textAdaptor'は、その実装に基づいてレンダリングされた出力を保持します。
// TextAdaptorの場合、これはコンソールに出力したり、テキストバッファを操作したりします。
console.log(textAdaptor.getOutput());
```

## 次のステップ

*   利用可能な関数とコンポーネントの詳細については、[APIドキュメント](./api-docs/modules.md)を参照してください。
*   高度なカスタマイズについては、[設定の詳細](./config-details-ja.md)を参照してください。