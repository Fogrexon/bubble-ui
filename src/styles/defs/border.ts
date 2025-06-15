import {
  parserGenerator,
  type PrimitiveTokenDefinition,
  type UnorderedDefinition,
} from 'bubble-ui-style-engine';

// BorderRadius Definition
const borderRadiusRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'length', // Assuming length can be px, %, em etc.
  id: 'borderRadius',
};
const borderRadiusParser = parserGenerator(borderRadiusRule);

export type BorderRadiusInterpreted = {
  borderRadius: string;
};
export const borderRadiusInterpreter = (value: string): BorderRadiusInterpreted => {
  const ast = borderRadiusParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  return {
    // @ts-ignore
    borderRadius: `${node.value}${node.unit || ''}`,
  };
};

// BorderColor Definition
const borderColorRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'color',
  id: 'borderColor',
};
const borderColorParser = parserGenerator(borderColorRule);

export type BorderColorInterpreted = {
  borderColor: string;
};
export const borderColorInterpreter = (value: string): BorderColorInterpreted => {
  const ast = borderColorParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  return {
    // @ts-ignore
    borderColor: node.unit ? `${node.value}${node.unit}` : node.value,
  };
};

// BorderWidth Definition
const borderWidthRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'length',
  id: 'borderWidth',
};
const borderWidthParser = parserGenerator(borderWidthRule);

export type BorderWidthInterpreted = {
  borderWidth: string;
};
export const borderWidthInterpreter = (value: string): BorderWidthInterpreted => {
  const ast = borderWidthParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  return {
    // @ts-ignore
    borderWidth: `${node.value}${node.unit || ''}`,
  };
};

// BorderStyle Definition
const borderStyleRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<none,hidden,dotted,dashed,solid,double,groove,ridge,inset,outset>',
  id: 'borderStyle',
};
const borderStyleParser = parserGenerator(borderStyleRule);

export type BorderStyleInterpreted = {
  borderStyle: string;
};
export const borderStyleInterpreter = (value: string): BorderStyleInterpreted => {
  const ast = borderStyleParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  return {
    // @ts-ignore
    borderStyle: node.value,
  };
};

// Border Rule (unordered combination of borderColor, borderWidth, borderStyle)
const borderRule: UnorderedDefinition = {
  type: 'unordered',
  id: 'border',
  rules: [borderColorRule, borderWidthRule, borderStyleRule],
};
export const borderParser = parserGenerator(borderRule);

export type BorderInterpreted = {
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
};
export const borderInterpreter = (value: string): BorderInterpreted => {
  const ast = borderParser(value);
  const result: BorderInterpreted = {};
  // @ts-ignore
  ast.children[0].children.forEach((child) => {
    // @ts-ignore
    const subNode = child.children[0];
    if (child.id === 'borderColor') {
      // @ts-ignore
      result.borderColor = subNode.unit ? `${subNode.value}${subNode.unit}` : subNode.value;
    } else if (child.id === 'borderWidth') {
      // @ts-ignore
      result.borderWidth = `${subNode.value}${subNode.unit || ''}`;
    } else if (child.id === 'borderStyle') {
      // @ts-ignore
      result.borderStyle = subNode.value;
    }
  });
  return result;
};
