import {Gearbox, GearboxMode, GearboxPosition} from './gearbox';
import {GEARBOX_CHARACTERISTICS} from '../constants';

describe('Gearbox', () => {
  let gearbox;

  it('should create an instance', () => {
    expect(new Gearbox(6, null)).toBeTruthy();
  });

  describe('Eco Mode', () => {
    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Drive, GearboxMode.Eco);
    });

    it('should return number of gears to decrease', () => {
      expect(gearbox.countKickdownGearDecrease(0.3)).toBe(0);
      expect(gearbox.countKickdownGearDecrease(0.8)).toBe(0);
    });
  });

  describe('Comfort Mode', () => {
    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Drive, GearboxMode.Comfort);
    });

    it('should return number of gears to decrease', () => {
      expect(gearbox.countKickdownGearDecrease(0.3)).toBe(0);
      expect(gearbox.countKickdownGearDecrease(0.49)).toBe(0);
      expect(gearbox.countKickdownGearDecrease(0.5)).toBe(1);
      expect(gearbox.countKickdownGearDecrease(0.7)).toBe(1);
    });
  });

  describe('Sport Mode', () => {
    beforeEach(() => {
      const characteristics = {...GEARBOX_CHARACTERISTICS};
      characteristics[GearboxMode.Sport].throttle.nextLevelKickdown.nextLevelKickdown = {
        decreaseGearMaxRpmLevel: 5000,
        maxThrottleLevel: 0.95,
        nextLevelKickdown: {
          decreaseGearMaxRpmLevel: 5000,
          maxThrottleLevel: null,
          nextLevelKickdown: null,
        },
      };
      gearbox = new Gearbox(6, characteristics, GearboxPosition.Drive, GearboxMode.Sport);
    });

    it('should return number of gears to decrease', () => {
      expect(gearbox.countKickdownGearDecrease(0.3)).toBe(0);
      expect(gearbox.countKickdownGearDecrease(0.49)).toBe(0);
      expect(gearbox.countKickdownGearDecrease(0.5)).toBe(1);
      expect(gearbox.countKickdownGearDecrease(0.69)).toBe(1);
      expect(gearbox.countKickdownGearDecrease(0.7)).toBe(2);
      expect(gearbox.countKickdownGearDecrease(0.9)).toBe(2);
      expect(gearbox.countKickdownGearDecrease(0.99)).toBe(3);
    });
  });

});
