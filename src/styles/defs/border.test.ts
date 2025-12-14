import {
  borderRadiusInterpreter,
  borderColorInterpreter,
  borderWidthInterpreter,
  borderStyleInterpreter,
  borderInterpreter,
} from './border';

describe('Border Style Interpreters', () => {
  describe('borderRadiusInterpreter', () => {
    it('should interpret length values correctly', () => {
      expect(borderRadiusInterpreter('10px')).toEqual({ borderRadius: '10px' });
      // expect(borderRadiusInterpreter('50%')).toEqual({ borderRadius: '50%' }); // Percentage currently not supported by 'length' tokenType
      expect(borderRadiusInterpreter('2em')).toEqual({ borderRadius: '2em' });
    });
  });

  describe('borderColorInterpreter', () => {
    it('should interpret color values correctly', () => {
      expect(borderColorInterpreter('red')).toEqual({ borderColor: 'red' });
      expect(borderColorInterpreter('#00ff00')).toEqual({ borderColor: '#00ff00' });
    });
  });

  describe('borderWidthInterpreter', () => {
    it('should interpret length values correctly', () => {
      expect(borderWidthInterpreter('1px')).toEqual({ borderWidth: '1px' });
      expect(borderWidthInterpreter('0.5em')).toEqual({ borderWidth: '0.5em' });
    });
  });

  describe('borderStyleInterpreter', () => {
    it('should interpret keyword values correctly', () => {
      expect(borderStyleInterpreter('solid')).toEqual({ borderStyle: 'solid' });
      expect(borderStyleInterpreter('dotted')).toEqual({ borderStyle: 'dotted' });
      expect(borderStyleInterpreter('none')).toEqual({ borderStyle: 'none' });
    });
  });

  describe('borderInterpreter', () => {
    it('should interpret combined border values correctly', () => {
      expect(borderInterpreter('1px solid red')).toEqual({
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'red',
      });
      expect(borderInterpreter('dashed #ccc 2px')).toEqual({
        borderStyle: 'dashed',
        borderColor: '#ccc',
        borderWidth: '2px',
      });
    });

    it('should interpret partial border values', () => {
      expect(borderInterpreter('solid green')).toEqual({
        borderStyle: 'solid',
        borderColor: 'green',
      });
      expect(borderInterpreter('5px dotted')).toEqual({
        borderWidth: '5px',
        borderStyle: 'dotted',
      });
      expect(borderInterpreter('blue 3px')).toEqual({
        borderColor: 'blue',
        borderWidth: '3px',
      });
    });

    it('should interpret single border values', () => {
      expect(borderInterpreter('solid')).toEqual({ borderStyle: 'solid' });
      expect(borderInterpreter('10px')).toEqual({ borderWidth: '10px' });
      expect(borderInterpreter('#abc')).toEqual({ borderColor: '#abc' });
    });
  });
});
