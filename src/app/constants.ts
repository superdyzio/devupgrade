import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from './enums';

export const MAX_RPM = 7000;
export const MIN_RPM = 500;
export const RPM_STEP = 500;
export const RPM_LOSS_ON_ENGINE_BRAKE = 200;
export const REFRESH_STATE_INTERVAL_MS = 500;
export const GEARBOX_CHARACTERISTICS = {
  [GearboxMode.Eco]: {
    throttle: {
      increaseGearRpmLevel: 2000,
      decreaseGearRpmLevel: 1000,
      maxThrottleLevel: null,
      nextLevelKickdown: null,
    },
    brake: {
      decreaseGearRpmLevel: 1500,
    }
  },
  [GearboxMode.Comfort]: {
    throttle: {
      increaseGearRpmLevel: 2500,
      decreaseGearRpmLevel: 1000,
      maxThrottleLevel: 0.5,
      nextLevelKickdown: {
        decreaseGearMaxRpmLevel: 4500,
        maxThrottleLevel: null,
        nextLevelKickdown: null
      }
    },
    brake: {
      decreaseGearRpmLevel: 2000
    }
  },
  [GearboxMode.Sport]: {
    throttle: {
      increaseGearRpmLevel: 5000,
      decreaseGearRpmLevel: 1500,
      maxThrottleLevel: 0.5,
      nextLevelKickdown: {
        decreaseGearMaxRpmLevel: 5000,
        maxThrottleLevel: 0.7,
        nextLevelKickdown: {
          decreaseGearMaxRpmLevel: 5000,
          maxThrottleLevel: null,
          nextLevelKickdown: null,
        }
      }
    },
    brake: {
      decreaseGearRpmLevel: 3000
    }
  }
};
export const AGGRESSION_MULTIPLIER_MAP = {
  [GearboxMode.Eco]: 1,
  [GearboxMode.Comfort]: 1,
  [GearboxMode.Sport]: {
    [GearboxAggressionLevel.Low]: 1,
    [GearboxAggressionLevel.Medium]: 1.3,
    [GearboxAggressionLevel.High]: 1.3,
  }
};
export const GEARBOX_GEAR_SYMBOL_MAP = {
  [GearboxPosition.Parking]: 'P',
  [GearboxPosition.Reverse]: 'R',
  [GearboxPosition.Neutral]: 'N'
};
