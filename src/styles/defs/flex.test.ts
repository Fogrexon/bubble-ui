import {
  flexDirectionInterpreter,
  justifyContentInterpreter,
  alignItemsInterpreter,
  flexWrapInterpreter,
} from './flex';

describe('Flexbox Style Interpreters', () => {
  describe('flexDirectionInterpreter', () => {
    it('should interpret keyword values correctly for flexDirection', () => {
      expect(flexDirectionInterpreter('row')).toEqual({ flexDirection: 'row' });
      expect(flexDirectionInterpreter('column-reverse')).toEqual({ flexDirection: 'column-reverse' });
    });
  });

  describe('justifyContentInterpreter', () => {
    it('should interpret keyword values correctly for justifyContent', () => {
      expect(justifyContentInterpreter('center')).toEqual({ justifyContent: 'center' });
      expect(justifyContentInterpreter('space-between')).toEqual({ justifyContent: 'space-between' });
    });
  });

  describe('alignItemsInterpreter', () => {
    it('should interpret keyword values correctly for alignItems', () => {
      expect(alignItemsInterpreter('stretch')).toEqual({ alignItems: 'stretch' });
      expect(alignItemsInterpreter('flex-start')).toEqual({ alignItems: 'flex-start' });
    });
  });

  describe('flexWrapInterpreter', () => {
    it('should interpret keyword values correctly for flexWrap', () => {
      expect(flexWrapInterpreter('nowrap')).toEqual({ flexWrap: 'nowrap' });
      expect(flexWrapInterpreter('wrap')).toEqual({ flexWrap: 'wrap' });
    });
  });
});
