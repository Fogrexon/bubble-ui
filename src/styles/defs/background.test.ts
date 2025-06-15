import {
  backgroundColorInterpreter,
  backgroundImageInterpreter,
  backgroundInterpreter,
} from './background';

describe('Background Style Interpreters', () => {
  describe('backgroundColorInterpreter', () => {
    it('should interpret color values correctly', () => {
      expect(backgroundColorInterpreter('#ff0000')).toEqual({ backgroundColor: '#ff0000' });
      expect(backgroundColorInterpreter('rgb(0,255,0)')).toEqual({ backgroundColor: 'rgb(0,255,0)' });
      expect(backgroundColorInterpreter('blue')).toEqual({ backgroundColor: 'blue' });
    });
  });

  describe('backgroundImageInterpreter', () => {
    it('should interpret image urls correctly', () => {
      expect(backgroundImageInterpreter('url(test.png)')).toEqual({ backgroundImage: 'url(test.png)' });
      expect(backgroundImageInterpreter("url('http://example.com/image.jpg')")).toEqual({ backgroundImage: "url(http://example.com/image.jpg)" });
    });
  });

  describe('backgroundInterpreter', () => {
    it('should interpret combined background values correctly', () => {
      expect(backgroundInterpreter('red url(test.png)')).toEqual({
        backgroundColor: 'red',
        backgroundImage: 'url(test.png)', // Assuming 'image' parser extracts 'test.png' and interpreter re-wraps
      });
      expect(backgroundInterpreter('url(img.jpeg) #00ff00')).toEqual({
        backgroundColor: '#00ff00',
        backgroundImage: 'url(img.jpeg)',
      });
    });

    it('should interpret only color', () => {
      expect(backgroundInterpreter('blue')).toEqual({ backgroundColor: 'blue' });
    });

    it('should interpret only image', () => {
      expect(backgroundInterpreter('url(another.gif)')).toEqual({ backgroundImage: 'url(another.gif)' });
    });
  });
});
