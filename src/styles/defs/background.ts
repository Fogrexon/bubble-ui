import {
  parserGenerator,
  type PrimitiveTokenDefinition,
  type UnorderedDefinition,
  // type URLTokenDefinition, // Or if URLTokenDefinition exists
} from 'bubble-ui-style-engine';

// BackgroundColor Definition
const backgroundColorRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'color',
  id: 'backgroundColor',
};
const backgroundColorParser = parserGenerator(backgroundColorRule);

export type BackgroundColorInterpreted = {
  backgroundColor: string;
};
export const backgroundColorInterpreter = (value: string): BackgroundColorInterpreted => {
  const ast = backgroundColorParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0];
  // @ts-ignore
  return {
    backgroundColor: node.unit ? `${node.value}${node.unit}` : node.value,
  };
};

// BackgroundImage Definition
// Assuming 'image' or 'url' tokenType. If not, this needs adjustment.
// For simplicity, let's assume a keyword-like or a generic string for now if 'image' or 'url' tokenType is not standard.
// A more robust solution would use a specific tokenType for URLs if available.
const backgroundImageRule: PrimitiveTokenDefinition = {
  type: 'primitive',
  tokenType: 'image', // Use 'image' tokenType
  id: 'backgroundImage',
};
const backgroundImageParser = parserGenerator(backgroundImageRule);

export type BackgroundImageInterpreted = {
  backgroundImage: string; // e.g., "url(...)" or the extracted URL part
};
export const backgroundImageInterpreter = (value: string): BackgroundImageInterpreted => {
  const ast = backgroundImageParser(value);
  // @ts-ignore
  const node = ast.children[0].children[0]; // The 'image' parser extracts the URL content
  return {
    // @ts-ignore
    backgroundImage: `url(${node.value})`, // Re-wrap with url() if the parser only extracts the content
  };
};

// Background Rule (unordered combination of backgroundColor and backgroundImage)
const backgroundRule: UnorderedDefinition = {
  type: 'unordered',
  id: 'background',
  rules: [backgroundColorRule, backgroundImageRule], // Order might not matter for 'unordered'
};
export const backgroundParser = parserGenerator(backgroundRule);

export type BackgroundInterpreted = {
  backgroundColor?: string;
  backgroundImage?: string;
};
export const backgroundInterpreter = (value: string): BackgroundInterpreted => {
  const ast = backgroundParser(value);
  const result: BackgroundInterpreted = {};
  // @ts-ignore
  ast.children[0].children.forEach((child) => {
    // @ts-ignore
    const subNode = child.children[0];
    if (child.id === 'backgroundColor') {
      // @ts-ignore
      result.backgroundColor = subNode.unit ? `${subNode.value}${subNode.unit}` : subNode.value;
    } else if (child.id === 'backgroundImage') {
      // @ts-ignore
      result.backgroundImage = `url(${subNode.value})`; // Re-wrap with url()
    }
  });
  return result;
};
