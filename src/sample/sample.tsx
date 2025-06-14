import { TextAdaptor } from '../adaptor';
import { createRenderer } from '../core';

const textAdaptor = new TextAdaptor()

const renderer = createRenderer(textAdaptor)

const SampleComponent = () =>
  // sample component
   <element>
    <element>
      text
    </element>
    <element>
      text2
    </element>
  </element>


renderer.render(<SampleComponent />)