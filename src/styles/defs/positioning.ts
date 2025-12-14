import {
  parserGenerator,
  type PrimitiveTokenDefinition,
  type ChoiceDefinition,
} from 'bubble-ui-style-engine';

// Position Definition
const positionRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<static,relative,absolute,fixed,sticky>',
  id: 'position',
};
const positionParser = parserGenerator(positionRule);

export type PositionInterpreted = {
  position: string;
};
export const positionInterpreter = (value: string): PositionInterpreted => {
  const ast = positionParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  return {
    // @ts-ignore
    position: node.value,
  };
};

// Top Definition
const topLengthRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'length' };
const topPercentageRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'percentage' };
const topAutoRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'keyword<auto>' };

const topRule: ChoiceDefinition = {
  type: 'choice',
  id: 'top',
  rules: [topLengthRule, topPercentageRule, topAutoRule],
};
const topParser = parserGenerator(topRule);

export type TopInterpreted = {
  top: string;
};
export const topInterpreter = (value: string): TopInterpreted => {
  const ast = topParser(value);
  // @ts-ignore
  const choiceDefinitionNode = ast.children[0];
  // @ts-ignore
  const valueNode = choiceDefinitionNode.children[0];
  return {
    // @ts-ignore
    top: valueNode.tokenType === 'keyword' ? valueNode.value : `${valueNode.value}${valueNode.unit || ''}`,
  };
};

// Left Definition
const leftLengthRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'length' };
const leftPercentageRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'percentage' };
const leftAutoRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'keyword<auto>' };

const leftRule: ChoiceDefinition = {
  type: 'choice',
  id: 'left',
  rules: [leftLengthRule, leftPercentageRule, leftAutoRule],
};
const leftParser = parserGenerator(leftRule);

export type LeftInterpreted = {
  left: string;
};
export const leftInterpreter = (value: string): LeftInterpreted => {
  const ast = leftParser(value);
  // @ts-ignore
  const choiceDefinitionNode = ast.children[0];
  // @ts-ignore
  const valueNode = choiceDefinitionNode.children[0];
  return {
    // @ts-ignore
    left: valueNode.tokenType === 'keyword' ? valueNode.value : `${valueNode.value}${valueNode.unit || ''}`,
  };
};

// Right Definition
const rightLengthRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'length' };
const rightPercentageRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'percentage' };
const rightAutoRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'keyword<auto>' };

const rightRule: ChoiceDefinition = {
  type: 'choice',
  id: 'right',
  rules: [rightLengthRule, rightPercentageRule, rightAutoRule],
};
const rightParser = parserGenerator(rightRule);

export type RightInterpreted = {
  right: string;
};
export const rightInterpreter = (value: string): RightInterpreted => {
  const ast = rightParser(value);
  // @ts-ignore
  const choiceDefinitionNode = ast.children[0];
  // @ts-ignore
  const valueNode = choiceDefinitionNode.children[0];
  return {
    // @ts-ignore
    right: valueNode.tokenType === 'keyword' ? valueNode.value : `${valueNode.value}${valueNode.unit || ''}`,
  };
};

// Bottom Definition
const bottomLengthRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'length' };
const bottomPercentageRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'percentage' };
const bottomAutoRule: PrimitiveTokenDefinition = { type: 'primitive', tokenType: 'keyword<auto>' };

const bottomRule: ChoiceDefinition = {
  type: 'choice',
  id: 'bottom',
  rules: [bottomLengthRule, bottomPercentageRule, bottomAutoRule],
};
const bottomParser = parserGenerator(bottomRule);

export type BottomInterpreted = {
  bottom: string;
};
export const bottomInterpreter = (value: string): BottomInterpreted => {
  const ast = bottomParser(value);
  // @ts-ignore
  const choiceDefinitionNode = ast.children[0];
  // @ts-ignore
  const valueNode = choiceDefinitionNode.children[0];
  return {
    // @ts-ignore
    bottom: valueNode.tokenType === 'keyword' ? valueNode.value : `${valueNode.value}${valueNode.unit || ''}`,
  };
};
