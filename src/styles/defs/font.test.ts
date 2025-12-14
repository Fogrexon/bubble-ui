import { describe, it, expect } from 'vitest';
import {
  fontFamilyInterpreter,
  fontInterpreter,
  fontSizeInterpreter,
  fontStyleInterpreter,
  fontWeightInterpreter,
} from './font';

describe('fontFamilyRule', () => {
  it('should parse fontFamilyRule correctly', () => {
    const interpreted =  fontFamilyInterpreter('sans-serif');
    expect(interpreted).toEqual({
      fontFamily: 'sans-serif',
    });
  });
})

describe('fontSizeRule', () => {
  it('should parse fontSizeRule correctly', () => {
    const interpreted = fontSizeInterpreter('16px');
    expect(interpreted).toEqual({
      fontSize: '16px',
    });
  });
})

describe('fontWeightRule', () => {
  it('should parse fontWeightRule correctly', () => {
    const interpreted = fontWeightInterpreter('bold');
    expect(interpreted).toEqual({
      fontWeight: 'bold',
    });
  });
})

describe('fontStyleRule', () => {
  it('should parse fontStyleRule correctly', () => {
    const interpreted = fontStyleInterpreter('italic');
    expect(interpreted).toEqual({
      fontStyle: 'italic',
    });
  });
});

describe('fontRule', () => {
  it('should parse fontRule correctly', () => {
    const interpreted = fontInterpreter('16px sans-serif bold italic');
    expect(interpreted).toEqual({
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      fontStyle: 'italic',
    });
  });

  it('should parse partial fontRule correctly', () => {
    const interpreted = fontInterpreter('16px sans-serif');
    expect(interpreted).toEqual({
      fontSize: '16px',
      fontFamily: 'sans-serif',
    });
  })
})
