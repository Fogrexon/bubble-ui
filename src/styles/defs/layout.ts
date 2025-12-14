import {
  parserGenerator,
  type PrimitiveTokenDefinition,
  type ChoiceDefinition,
} from 'bubble-ui-style-engine';

// Padding Definition
const paddingLengthRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'length' };
const paddingPercentageRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'percentage' };

const paddingRule: ChoiceDefinition = {
  type: 'choice',
  id: 'padding',
  rules: [paddingLengthRule, paddingPercentageRule],
};
const paddingParser = parserGenerator(paddingRule);

export type PaddingInterpreted = {
  padding: string;
};
export const paddingInterpreter = (value: string): PaddingInterpreted => {
  const ast = paddingParser(value);
  // @ts-ignore
  const choiceDefinitionNode = ast.children[0];
  // @ts-ignore
  const valueNode = choiceDefinitionNode.children[0];
  return {
    // @ts-ignore
    padding: `${valueNode.value}${valueNode.unit || ''}`,
  };
};

// Margin Definition
const marginLengthRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'length' };
const marginPercentageRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'percentage' };
const marginAutoRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'keyword<auto>'};

const marginRule: ChoiceDefinition = {
  type: 'choice',
  id: 'margin',
  rules: [marginLengthRule, marginPercentageRule, marginAutoRule],
};
const marginParser = parserGenerator(marginRule);

export type MarginInterpreted = {
  margin: string;
};
export const marginInterpreter = (value: string): MarginInterpreted => {
  const ast = marginParser(value);
  // @ts-ignore
  const choiceDefinitionNode = ast.children[0];
  // @ts-ignore
  const valueNode = choiceDefinitionNode.children[0];
  // @ts-ignore
  return {
    // @ts-ignore
    margin: valueNode.tokenType === 'keyword' ? valueNode.value : `${valueNode.value}${valueNode.unit || ''}`,
  };
};

// Width Definition
const widthLengthRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'length' };
const widthPercentageRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'percentage' };
const widthAutoRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'keyword<auto>'};

const widthRule: ChoiceDefinition = {
  type: 'choice',
  id: 'width',
  rules: [widthLengthRule, widthPercentageRule, widthAutoRule],
};
const widthParser = parserGenerator(widthRule);

export type WidthInterpreted = {
  width: string;
};
export const widthInterpreter = (value: string): WidthInterpreted => {
  const ast = widthParser(value);
  // @ts-ignore
  const choiceDefinitionNode = ast.children[0];
  // @ts-ignore
  const valueNode = choiceDefinitionNode.children[0];
  // @ts-ignore
  return {
    // @ts-ignore
    width: valueNode.tokenType === 'keyword' ? valueNode.value : `${valueNode.value}${valueNode.unit || ''}`,
  };
};

// Height Definition
const heightLengthRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'length' };
const heightPercentageRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'percentage' };
const heightAutoRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'keyword<auto>'};

const heightRule: ChoiceDefinition = {
  type: 'choice',
  id: 'height',
  rules: [heightLengthRule, heightPercentageRule, heightAutoRule],
};
const heightParser = parserGenerator(heightRule);

export type HeightInterpreted = {
  height: string;
};
export const heightInterpreter = (value: string): HeightInterpreted => {
  const ast = heightParser(value);
  // @ts-ignore
  const choiceDefinitionNode = ast.children[0];
  // @ts-ignore
  const valueNode = choiceDefinitionNode.children[0];
  // @ts-ignore
  return {
    // @ts-ignore
    height: valueNode.tokenType === 'keyword' ? valueNode.value : `${valueNode.value}${valueNode.unit || ''}`,
  };
};
