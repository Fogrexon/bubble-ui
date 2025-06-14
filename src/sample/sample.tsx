import { createRenderer } from 'bubble-ui';
import { TextAdaptor } from '../adaptor/text/TextAdaptor';

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