import {
  parserGenerator,
  type PrimitiveTokenDefinition,
} from 'bubble-ui-style-engine';

// FlexDirection Definition
const flexDirectionRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<row,row-reverse,column,column-reverse>',
  id: 'flexDirection',
};
const flexDirectionParser = parserGenerator(flexDirectionRule);

export type FlexDirectionInterpreted = {
  flexDirection: string;
};
export const flexDirectionInterpreter = (value: string): FlexDirectionInterpreted => {
  const ast = flexDirectionParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  return {
    // @ts-ignore
    flexDirection: node.value,
  };
};

// JustifyContent Definition
const justifyContentRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<flex-start,flex-end,center,space-between,space-around,space-evenly>',
  id: 'justifyContent',
};
const justifyContentParser = parserGenerator(justifyContentRule);

export type JustifyContentInterpreted = {
  justifyContent: string;
};
export const justifyContentInterpreter = (value: string): JustifyContentInterpreted => {
  const ast = justifyContentParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  return {
    // @ts-ignore
    justifyContent: node.value,
  };
};

// AlignItems Definition
const alignItemsRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<stretch,flex-start,flex-end,center,baseline>',
  id: 'alignItems',
};
const alignItemsParser = parserGenerator(alignItemsRule);

export type AlignItemsInterpreted = {
  alignItems: string;
};
export const alignItemsInterpreter = (value: string): AlignItemsInterpreted => {
  const ast = alignItemsParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  return {
    // @ts-ignore
    alignItems: node.value,
  };
};

// FlexWrap Definition
const flexWrapRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'keyword<nowrap,wrap,wrap-reverse>',
  id: 'flexWrap',
};
const flexWrapParser = parserGenerator(flexWrapRule);

export type FlexWrapInterpreted = {
  flexWrap: string;
};
export const flexWrapInterpreter = (value: string): FlexWrapInterpreted => {
  const ast = flexWrapParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  return {
    // @ts-ignore
    flexWrap: node.value,
  };
};
