import { Gearbox } from './gearbox';

describe('Gearbox', () => {
  it('should create an instance', () => {
    expect(new Gearbox(6, null)).toBeTruthy();
  });
});
