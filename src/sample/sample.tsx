import { DOMAdaptor, TextAdaptor } from '../adaptor'; // DOMAdaptor をインポート
// import { TextAdaptor } from '../adaptor'; // TextAdaptor はコメントアウト
import { type BubbleFC, createRenderer, useCallback, useState } from '../core';

// DOMAdaptorを使用する
const domAdaptor = new DOMAdaptor();
const domRenderer = createRenderer(domAdaptor);

// DOMにシンプルなdivを表示するコンポーネント
// const DOMSampleComponent = () => (
//   <element key="dom-root" style={{ padding: '20px', backgroundColor: 'lightgray' }}>
//     <element key="dom-title" style={{ fontSize: '24px', color: 'blue' }}>Hello DOM!</element>
//     <element key="dom-text">This is rendered by DOMAdaptor.</element>
//   </element>
// );

// DOMSampleComponentをレンダリング
// コンテナを省略すると、DOMAdaptorのcreateDefaultRootElementが呼ばれ、bodyにdivが追加される
// domRenderer.render(<DOMSampleComponent />);


// 以下は既存のEventComponentのコード (TextAdaptorベースのrendererを使っていた部分を修正する必要があるかもしれない)
// 現状では、domRendererがEventComponentもレンダリングしようとするが、
// EventComponent内のJSXの<element>タグはDOMAdaptorでは未サポートなのでエラーになる。
// EventComponentをDOMで表示するには、<element>を<div>などに書き換える必要がある。
// ここでは一旦、EventComponentのrenderer呼び出しをコメントアウトしておく。

const textAdaptor = new TextAdaptor() // コメントアウト
const textRenderer = createRenderer(textAdaptor) // コメントアウト

const SampleComponent = () =>
  // sample component
   <element key="root">
    <element key={"text1"}>
      text
    </element>
     <element key={"text2"}>
       text2
     </element>
     <element key={"text3"}>
       text3
     </element>
  </element>

textRenderer.render(<SampleComponent />); // TextAdaptorでレンダリングする場合は有効

// const InnerComponent = ({text}: {text: string}) =>
//   <element key="inner">
//     <element key={"inner-text"}>
//       {text}
//     </element>
//   </element>

// const LittleDiff = () =>
//   <element key="root">
//     <element key={"text1"}>
//       text-altered
//     </element>
//     <element key={"text3"}>
//       text3
//       <element key={"text4"}>
//         text4
//         text4-2
//       </element>
//     </element>
//     <element key={"text2"}>
//       text2
//       <InnerComponent text="inner text" />
//     </element>
//   </element>


// // renderer.render の呼び出し時、コンテナ引数を省略する
// // Renderer がアダプタの createDefaultRootElement を使用してルートコンテナを初期化する
// textRenderer.render(<SampleComponent />);

// // 2回目のrender呼び出しでもコンテナは省略可能 (同じデフォルトコンテナが使われる)
// renderer.render(<LittleDiff />);

type EventComponentProps = {
  outerText: string;
}

const EventComponent: BubbleFC<EventComponentProps> = ({outerText}) => {
  const [texts, setTexts] = useState<string[]>(['Initial Text']);
  const handleClick = useCallback(() => {
    console.log('Element clicked');
    setTexts((prev) => [...prev, `Text ${prev.length + 1}`]);
  });

  return (
    <element key="event-root" onClick={handleClick}>
      {outerText}
      <element key="event-text">Event Component</element>
      <element key="event-texts">
        {texts.map((text, index) => (
          <element key={`event-text-${index}`}>{text}</element>
        ))}
      </element>
    </element>
  );
}

// renderer.render(<EventComponent />); // DOMAdaptorで<element>タグは動作しないためコメントアウト
// もしEventComponentをDOMで表示したい場合は、以下のようにする：
// 1. EventComponent内の<element>を<div>に書き換える
// 2. domRenderer.render(<EventComponent />); を呼び出す
domRenderer.render(<EventComponent outerText={"text"} />); // TextAdaptorでレンダリングする場合は有効