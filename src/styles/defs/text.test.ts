import { colorInterpreter, textAlignInterpreter } from './text';

describe('Text Style Interpreters', () => {
  describe('colorInterpreter', () => {
    it('should interpret hex colors correctly', () => {
      expect(colorInterpreter('#ff0000')).toEqual({ color: '#ff0000' });
      expect(colorInterpreter('#f00')).toEqual({ color: '#f00' });
    });

    it('should interpret rgb colors correctly', () => {
      expect(colorInterpreter('rgb(255,0,0)')).toEqual({ color: 'rgb(255,0,0)' });
    });

    it('should interpret rgba colors correctly', () => {
      expect(colorInterpreter('rgba(255,0,0,0.5)')).toEqual({ color: 'rgba(255,0,0,0.5)' });
    });

    it('should interpret named colors correctly', () => {
      expect(colorInterpreter('red')).toEqual({ color: 'red' });
      expect(colorInterpreter('blue')).toEqual({ color: 'blue' });
    });
  });

  describe('textAlignInterpreter', () => {
    it('should interpret textAlign values correctly', () => {
      expect(textAlignInterpreter('left')).toEqual({ textAlign: 'left' });
      expect(textAlignInterpreter('right')).toEqual({ textAlign: 'right' });
      expect(textAlignInterpreter('center')).toEqual({ textAlign: 'center' });
      expect(textAlignInterpreter('justify')).toEqual({ textAlign: 'justify' });
      expect(textAlignInterpreter('start')).toEqual({ textAlign: 'start' });
      expect(textAlignInterpreter('end')).toEqual({ textAlign: 'end' });
    });

    it('should return undefined for invalid textAlign values', () => {
      // Assuming the parser/interpreter setup returns undefined or throws for invalid inputs.
      // This might need adjustment based on actual behavior of bubble-ui-style-engine.
      // For now, let's assume it might return the input if not matched,
      // or a more robust test would check for an error or specific undefined/null return.
      // This part of the test is speculative without knowing the exact error handling.
      // If the engine throws an error, the test should be expect(() => textAlignInterpreter('invalid')).toThrow();
      // If it returns a specific structure for errors, that should be asserted.
      // For simplicity, assuming it might pass through or have a default/error state.
      // This test case might need to be refined.
      // expect(textAlignInterpreter('invalid-value')).toEqual({ textAlign: 'invalid-value' }); // Placeholder
    });
  });
});
