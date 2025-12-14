import {
  parserGenerator,
  type PrimitiveTokenDefinition,
} from 'bubble-ui-style-engine';

// Color Definition
const colorRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'color', // Assuming 'color' is a valid tokenType in bubble-ui-style-engine
  id: 'color',
};
const colorParser = parserGenerator(colorRule);

export type ColorInterpreted = {
  color: string;
};
export const colorInterpreter = (value: string): ColorInterpreted => {
  const ast = colorParser(value);
  // @ts-ignore
  const colorNode = ast.children[0].children[0];
  return {
    // Assuming color node structure is { value: '...', unit: '...' } or just { value: '...' }
    // Adjust based on actual AST structure for color
    color: colorNode.unit ? `${colorNode.value}${colorNode.unit}` : colorNode.value,
  };
};

// TextAlign Definition
const textAlignRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<left,right,center,justify,start,end>',
  id: 'textAlign',
};
const textAlignParser = parserGenerator(textAlignRule);

export type TextAlignInterpreted = {
  textAlign: string;
};
export const textAlignInterpreter = (value: string): TextAlignInterpreted => {
  const ast = textAlignParser(value);
  // @ts-ignore
  const textAlignNode = ast.children[0].children[0];
  return {
    textAlign: textAlignNode.value,
  };
};
