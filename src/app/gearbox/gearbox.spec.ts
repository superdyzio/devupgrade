import { Gearbox, GearboxAggressionLevel, GearboxMode, GearboxPosition } from './gearbox';
import { GEARBOX_CHARACTERISTICS } from '../constants';

describe('Gearbox', () => {
  let gearbox: Gearbox;

  it('should create an instance', () => {
    expect(new Gearbox(6, null)).toBeTruthy();
  });

  describe('setGearboxPosition', () => {
    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Parking, GearboxMode.Eco);
    });

    it('should set gearbox position to drive and change current gear to 1', () => {
      expect(gearbox.position).toEqual(GearboxPosition.Parking);
      expect(gearbox.currentGear).toBeNull();

      gearbox.setGearboxPosition(GearboxPosition.Drive);

      expect(gearbox.position).toEqual(GearboxPosition.Drive);
      expect(gearbox.currentGear).toEqual(1);
    });

    it('should set gearbox position to reverse and change current gear to null', () => {
      expect(gearbox.position).toEqual(GearboxPosition.Parking);
      expect(gearbox.currentGear).toBeNull();

      gearbox.setGearboxPosition(GearboxPosition.Reverse);

      expect(gearbox.position).toEqual(GearboxPosition.Reverse);
      expect(gearbox.currentGear).toBeNull();
    });
  });

  describe('setGearboxMode', () => {
    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Parking, GearboxMode.Eco);
    });

    it('should change gearbox mode to Comfort', () => {
      expect(gearbox.mode).toEqual(GearboxMode.Eco);

      gearbox.setGearboxMode(GearboxMode.Comfort);

      expect(gearbox.mode).toEqual(GearboxMode.Comfort);
    });
  });

  describe('setGearboxAggressionLevel', () => {
    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Parking, GearboxMode.Eco);
    });

    it('should change gearbox aggression level to high', () => {
      expect(gearbox.aggressionLevel).toEqual(GearboxAggressionLevel.Low);

      gearbox.setGearboxAggressionLevel(GearboxAggressionLevel.High);

      expect(gearbox.aggressionLevel).toEqual(GearboxAggressionLevel.High);
    });
  });

  describe('isPositionDrive', () => {
    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Parking, GearboxMode.Eco);
    });

    it('should return false', () => {
      expect(gearbox.isPositionDrive()).toBe(false);
    });

    it('should return true', () => {
      gearbox.setGearboxPosition(GearboxPosition.Drive);

      expect(gearbox.isPositionDrive()).toBe(true);
    });
  });

  describe('increaseGear', () => {
    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Drive, GearboxMode.Eco);
    });

    it('should increase gear and return true', () => {
      gearbox.currentGear = 1;

      expect(gearbox.increaseGear()).toBe(true);
      expect(gearbox.currentGear).toEqual(2);
    });

    it('should not increase gear and return false', () => {
      gearbox.currentGear = gearbox.maxGear;

      expect(gearbox.increaseGear()).toBe(false);
      expect(gearbox.currentGear).toEqual(gearbox.maxGear);
    });
  });

  describe('decreaseGear', () => {
    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Drive, GearboxMode.Eco);
    });

    it('should decrease gear and return true', () => {
      gearbox.currentGear = gearbox.maxGear;

      expect(gearbox.decreaseGear()).toBe(true);
      expect(gearbox.currentGear).toEqual(gearbox.maxGear - 1);
    });

    it('should not decrease gear return false', () => {
      gearbox.currentGear = 1;

      expect(gearbox.decreaseGear()).toBe(false);
      expect(gearbox.currentGear).toEqual(1);
    });
  });


  describe('Eco Mode', () => {
    const gearMode = GearboxMode.Eco;

    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Parking, gearMode);
    });

    it('should return rpm level to increase gear', () => {
      expect(gearbox.getIncreaseGearRpmLevel()).toEqual(GEARBOX_CHARACTERISTICS[gearMode].throttle.increaseGearRpmLevel);
    });

    it('should return rpm level to decrease gear', () => {
      expect(gearbox.getDecreaseGearRpmLevel(true)).toEqual(GEARBOX_CHARACTERISTICS[gearMode].brake.decreaseGearRpmLevel);
      expect(gearbox.getDecreaseGearRpmLevel(false)).toEqual(GEARBOX_CHARACTERISTICS[gearMode].throttle.decreaseGearRpmLevel);
    });

    it('should return max throttle rpm level', () => {
      expect(gearbox.getMaxThrottleLevel()).toEqual(1);
    });

    it('should return number of gears to decrease', () => {
      expect(gearbox.countKickdownGearDecrease(0.3)).toEqual(0);
      expect(gearbox.countKickdownGearDecrease(0.8)).toEqual(0);
    });

    it('should return multiplier for aggression mode', () => {
      expect(gearbox.getAggressionMultiplier()).toBe(1);

      gearbox.setGearboxAggressionLevel(3);

      expect(gearbox.getAggressionMultiplier()).toBe(1);
    });
  });

  describe('Comfort Mode', () => {
    const gearMode = GearboxMode.Comfort;

    beforeEach(() => {
      gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS, GearboxPosition.Drive, gearMode);
    });

    it('should return rpm level to increase gear', () => {
      expect(gearbox.getIncreaseGearRpmLevel()).toEqual(GEARBOX_CHARACTERISTICS[gearMode].throttle.increaseGearRpmLevel);
    });

    it('should return rpm level to decrease gear', () => {
      expect(gearbox.getDecreaseGearRpmLevel(true)).toEqual(GEARBOX_CHARACTERISTICS[gearMode].brake.decreaseGearRpmLevel);
      expect(gearbox.getDecreaseGearRpmLevel(false)).toEqual(GEARBOX_CHARACTERISTICS[gearMode].throttle.decreaseGearRpmLevel);
    });

    it('should return max throttle rpm level', () => {
      expect(gearbox.getMaxThrottleLevel()).toEqual(GEARBOX_CHARACTERISTICS[gearMode].throttle.maxThrottleLevel);
    });

    it('should return number of gears to decrease', () => {
      expect(gearbox.countKickdownGearDecrease(0.3)).toEqual(0);
      expect(gearbox.countKickdownGearDecrease(0.49)).toEqual(0);
      expect(gearbox.countKickdownGearDecrease(0.5)).toEqual(1);
      expect(gearbox.countKickdownGearDecrease(0.7)).toEqual(1);
    });

    it('should return max rpm level for gear decrease when kickdown', () => {
      const kickdownCharacteristics = GEARBOX_CHARACTERISTICS[gearMode].throttle.nextLevelKickdown;

      expect(gearbox.getKickdownDecreaseGearMaxRpmLevel(0.5)).toBe(kickdownCharacteristics.decreaseGearMaxRpmLevel);
      expect(gearbox.getKickdownDecreaseGearMaxRpmLevel(0.7)).toBe(kickdownCharacteristics.decreaseGearMaxRpmLevel);

      gearbox.setGearboxAggressionLevel(3);

      expect(gearbox.getKickdownDecreaseGearMaxRpmLevel(0.5)).toBe(kickdownCharacteristics.decreaseGearMaxRpmLevel);
      expect(gearbox.getKickdownDecreaseGearMaxRpmLevel(0.7)).toBe(kickdownCharacteristics.decreaseGearMaxRpmLevel);
    });

    it('should return multiplier for aggression mode', () => {
      expect(gearbox.getAggressionMultiplier()).toBe(1);

      gearbox.setGearboxAggressionLevel(3);

      expect(gearbox.getAggressionMultiplier()).toBe(1);
    });
  });

  describe('Sport Mode', () => {
    const gearMode = GearboxMode.Sport;

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

    it('should return rpm level to increase gear', () => {
      expect(gearbox.getIncreaseGearRpmLevel()).toEqual(GEARBOX_CHARACTERISTICS[gearMode].throttle.increaseGearRpmLevel);
    });

    it('should return rpm level to decrease gear', () => {
      expect(gearbox.getDecreaseGearRpmLevel(true)).toEqual(GEARBOX_CHARACTERISTICS[gearMode].brake.decreaseGearRpmLevel);
      expect(gearbox.getDecreaseGearRpmLevel(false)).toEqual(GEARBOX_CHARACTERISTICS[gearMode].throttle.decreaseGearRpmLevel);
    });

    it('should return max throttle rpm level', () => {
      expect(gearbox.getMaxThrottleLevel()).toEqual(GEARBOX_CHARACTERISTICS[gearMode].throttle.maxThrottleLevel);
    });

    it('should return number of gears to decrease', () => {
      expect(gearbox.countKickdownGearDecrease(0.3)).toEqual(0);
      expect(gearbox.countKickdownGearDecrease(0.49)).toEqual(0);
      expect(gearbox.countKickdownGearDecrease(0.5)).toEqual(1);
      expect(gearbox.countKickdownGearDecrease(0.69)).toEqual(1);
      expect(gearbox.countKickdownGearDecrease(0.7)).toEqual(2);
      expect(gearbox.countKickdownGearDecrease(0.9)).toEqual(2);
      expect(gearbox.countKickdownGearDecrease(0.99)).toEqual(3);
    });

    it('should return max rpm level for gear decrease when kickdown', () => {
      const kickdownCharacteristics = GEARBOX_CHARACTERISTICS[gearMode].throttle.nextLevelKickdown;

      expect(gearbox.getKickdownDecreaseGearMaxRpmLevel(0.5)).toBe(kickdownCharacteristics.decreaseGearMaxRpmLevel);
      expect(gearbox.getKickdownDecreaseGearMaxRpmLevel(0.7)).toBe(kickdownCharacteristics.nextLevelKickdown.decreaseGearMaxRpmLevel);

      gearbox.setGearboxAggressionLevel(3);

      expect(gearbox.getKickdownDecreaseGearMaxRpmLevel(0.5)).toBe(kickdownCharacteristics.decreaseGearMaxRpmLevel * 1.3);
      expect(gearbox.getKickdownDecreaseGearMaxRpmLevel(0.7)).toBe(kickdownCharacteristics.nextLevelKickdown.decreaseGearMaxRpmLevel * 1.3);
    });

    it('should return multiplier for aggression mode', () => {
      expect(gearbox.getAggressionMultiplier()).toBe(1);

      gearbox.setGearboxAggressionLevel(3);

      expect(gearbox.getAggressionMultiplier()).toBe(1.3);
    });
  });

});
