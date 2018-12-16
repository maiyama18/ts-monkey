import hello from '../src';

describe('hello()', () => {
  it('should say hello to empty target', () => {
    expect(hello('')).toBe('hello!');
  });

  it('should say hello to non-empty target', () => {
    expect(hello('npm')).toBe('hello npm!');
  });
});
