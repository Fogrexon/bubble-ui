import {
  type ASTNode,
  parserGenerator,
  type PrimitiveTokenDefinition,
  type UnorderedDefinition,
} from 'bubble-ui-style-engine';

const fontFamilyRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<sans-serif,serif>',
  id: 'fontFamily',
}
const fontFamilyParser = parserGenerator(fontFamilyRule)

export type FontFamilyInterpreted = {
  fontFamily: string
}
export const fontFamilyInterpreter = (value: string): FontFamilyInterpreted => {
  const ast = fontFamilyParser(value)
  // ASTの構造は決まっている
  // @ts-ignore
  const fontFamilyNode = ast.children[0].children[0]
  return {
    fontFamily: fontFamilyNode.value,
  }
}

const fontSizeRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'length',
  id: 'fontSize',
}
const fontSizeParser = parserGenerator(fontSizeRule)

export type FontSizeInterpreted = {
  fontSize: string
}
export const fontSizeInterpreter = (value: string): FontSizeInterpreted => {
  const ast = fontSizeParser(value);
  // @ts-ignore
  const fontSizeNode = ast.children[0].children[0]
  return {
    fontSize: `${fontSizeNode.value}${fontSizeNode.unit}`
  }
}

const fontWeightRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<normal,bold,bolder,lighter,100,200,300,400,500,600,700,800,900>',
  id: 'fontWeight',
}
const fontWeightParser = parserGenerator(fontWeightRule)

export type FontWeightInterpreted = {
  fontWeight: string;
}
export const fontWeightInterpreter = (value: string): FontWeightInterpreted => {
  const ast = fontWeightParser(value);
  // @ts-ignore
  const fontWeightNode = ast.children[0].children[0]
  return {
    fontWeight: fontWeightNode.value,
  }
}

const fontStyleRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<normal,italic,oblique>',
  id: 'fontStyle',
}
const fontStyleParser = parserGenerator(fontStyleRule)

export type FontStyleInterpreted = {
  fontStyle: string;
}
export const fontStyleInterpreter = (value: string): FontStyleInterpreted => {
  const ast = fontStyleParser(value);
  // @ts-ignore
  const fontStyleNode = ast.children[0].children[0]
  return {
    fontStyle: fontStyleNode.value,
  }
}

const fontRule: UnorderedDefinition = {
  type: 'unordered',
  id: 'font',
  rules: [
    fontFamilyRule,
    fontSizeRule,
    fontWeightRule,
    fontStyleRule,
  ],
}
export const fontParser = parserGenerator(fontRule)

export type FontInterpreted = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
}
export const fontInterpreter = (value: string): FontInterpreted => {
  const ast = fontParser(value);
  const result: FontInterpreted = {};
  // @ts-ignore
  ast.children[0].children.forEach((child) => {
    if (child.id === 'fontFamily') {
      // @ts-ignore
      result.fontFamily = child.children[0].value;
    } else if (child.id === 'fontSize') {
      // @ts-ignore
      const fontSizeNode = child.children[0];
      result.fontSize = `${fontSizeNode.value}${fontSizeNode.unit}`;
    } else if (child.id === 'fontWeight') {
      // @ts-ignore
      result.fontWeight = child.children[0].value;
    } else if (child.id === 'fontStyle') {
      // @ts-ignore
      result.fontStyle = child.children[0].value;
    }
  });
  return result;
}
