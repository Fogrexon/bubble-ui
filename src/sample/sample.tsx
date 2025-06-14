import { TextAdaptor } from '../adaptor';
import { createRenderer, useEffect, useState } from '../core';

const textAdaptor = new TextAdaptor()

const renderer = createRenderer(textAdaptor)

// const SampleComponent = () =>
//   // sample component
//    <element key="root">
//     <element key={"text1"}>
//       text
//     </element>
//      <element key={"text2"}>
//        text2
//      </element>
//      <element key={"text3"}>
//        text3
//      </element>
//   </element>

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
// renderer.render(<SampleComponent />);

// // 2回目のrender呼び出しでもコンテナは省略可能 (同じデフォルトコンテナが使われる)
// renderer.render(<LittleDiff />);


const EventComponent = () => {
  const [texts, setTexts] = useState<string[]>(['Initial Text']);
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Interval running');
      setTexts((prev) => [...prev, `Text ${prev.length + 1}`]);
    }, 10000);
    return () => {
      clearInterval(intervalId);
      console.log('Interval cleared');
    };
  }, []);

  return (
    <element key="event-root">
      <element key="event-text">Event Component</element>
      <element key="event-texts">
        {texts.map((text, index) => (
          <element key={`event-text-${index}`}>{text}</element>
        ))}
      </element>
    </element>
  );
}

renderer.render(<EventComponent />);
