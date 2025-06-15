import {
  positionInterpreter,
  topInterpreter,
  leftInterpreter,
  rightInterpreter,
  bottomInterpreter,
} from './positioning';

describe('Positioning Style Interpreters', () => {
  describe('positionInterpreter', () => {
    it('should interpret keyword values correctly for position', () => {
      expect(positionInterpreter('static')).toEqual({ position: 'static' });
      expect(positionInterpreter('relative')).toEqual({ position: 'relative' });
      expect(positionInterpreter('absolute')).toEqual({ position: 'absolute' });
      expect(positionInterpreter('fixed')).toEqual({ position: 'fixed' });
      expect(positionInterpreter('sticky')).toEqual({ position: 'sticky' });
    });
  });

  describe('topInterpreter', () => {
    it('should interpret length values correctly for top', () => {
      expect(topInterpreter('10px')).toEqual({ top: '10px' });
      expect(topInterpreter('auto')).toEqual({ top: 'auto' });
    });
  });

  describe('leftInterpreter', () => {
    it('should interpret length values correctly for left', () => {
      expect(leftInterpreter('-5px')).toEqual({ left: '-5px' });
      expect(leftInterpreter('25%')).toEqual({ left: '25%' });
    });
  });

  describe('rightInterpreter', () => {
    it('should interpret length values correctly for right', () => {
      expect(rightInterpreter('0')).toEqual({ right: '0' }); // Assuming '0' is parsed as '0' without unit
    });
  });

  describe('bottomInterpreter', () => {
    it('should interpret length values correctly for bottom', () => {
      expect(bottomInterpreter('100%')).toEqual({ bottom: '100%' });
    });
  });
});
