import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from './enums';

export interface GearboxStatus {
  position: GearboxPosition;
  mode: GearboxMode;
  aggressionLevel: GearboxAggressionLevel;
  currentGear: number;
}

export interface GearboxKickdownCharacteristics {
  decreaseGearMaxRpmLevel: number;
  maxThrottleLevel: number | null;
  nextLevelKickdown: GearboxKickdownCharacteristics | null;
}

export interface GearboxThrottleCharacteristics {
  increaseGearRpmLevel: number;
  decreaseGearRpmLevel: number;
  maxThrottleLevel: number | null;
  nextLevelKickdown?: GearboxKickdownCharacteristics;
}

interface GearboxBrakeCharacteristics {
  decreaseGearRpmLevel: number;
}

interface GearboxModeCharacteristics {
  throttle: GearboxThrottleCharacteristics;
  brake: GearboxBrakeCharacteristics;
}

export type GearboxCharacteristics = {
  [key in GearboxMode]: GearboxModeCharacteristics;
};
