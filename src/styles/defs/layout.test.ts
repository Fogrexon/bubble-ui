import {
  paddingInterpreter,
  marginInterpreter,
  widthInterpreter,
  heightInterpreter,
} from './layout';

describe('Layout Style Interpreters', () => {
  describe('paddingInterpreter', () => {
    it('should interpret length values correctly for padding', () => {
      expect(paddingInterpreter('10px')).toEqual({ padding: '10px' });
      expect(paddingInterpreter('5%')).toEqual({ padding: '5%' });
      expect(paddingInterpreter('1em')).toEqual({ padding: '1em' });
    });
  });

  describe('marginInterpreter', () => {
    it('should interpret length values correctly for margin', () => {
      expect(marginInterpreter('20px')).toEqual({ margin: '20px' });
      expect(marginInterpreter('auto')).toEqual({ margin: 'auto' });
    });
  });

  describe('widthInterpreter', () => {
    it('should interpret length values correctly for width', () => {
      expect(widthInterpreter('100px')).toEqual({ width: '100px' });
      expect(widthInterpreter('50%')).toEqual({ width: '50%' });
      expect(widthInterpreter('auto')).toEqual({ width: 'auto' });
    });
  });

  describe('heightInterpreter', () => {
    it('should interpret length values correctly for height', () => {
      expect(heightInterpreter('200px')).toEqual({ height: '200px' });
      expect(heightInterpreter('75%')).toEqual({ height: '75%' });
      expect(heightInterpreter('auto')).toEqual({ height: 'auto' });
    });
  });
});
