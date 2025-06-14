import { TextAdaptor } from '../adaptor';
import { createRenderer } from '../core';

const textAdaptor = new TextAdaptor()

const renderer = createRenderer(textAdaptor)

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

const LittleDiff = () =>
  <element key="root">
    <element key={"text1"}>
      text-altered
    </element>
    <element key={"text3"}>
      text3
      <element key={"text4"}>
        text4
        text4-2
      </element>
    </element>
    <element key={"text2"}>
      text2
    </element>
  </element>


renderer.render(<SampleComponent />)

renderer.render(<LittleDiff />)