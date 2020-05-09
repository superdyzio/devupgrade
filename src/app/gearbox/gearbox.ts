export enum GearboxPosition {
  Parking = 'PARKING',
  Neutral = 'NEUTRAL',
  Reverse = 'REVERSE',
  Drive = 'DRIVE',
}

export enum GearboxMode {
  Eco = 'ECO',
  Comfort = 'COMFORT',
  Sport = 'SPORT',
  // SportPlus = 'SPORT_PLUS',
}

export enum GearboxAggressionLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

interface GearboxKickdownCharacteristics {
  decreaseGearMaxRpmLevel: number;
  maxThrottleLevel: number | null;
  nextLevelKickdown: GearboxKickdownCharacteristics | null;
}

interface GearboxThrottleCharacteristics {
  increaseGearRpmLevel: number;
  decreaseGearRpmLevel: number;
  maxThrottleLevel: number | null;
  kickdown?: GearboxKickdownCharacteristics;
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
}

export class Gearbox {
  public constructor(
    public maxGear: number,
    public characteristics: GearboxCharacteristics,
    public position: GearboxPosition = GearboxPosition.Parking,
    public mode: GearboxMode = GearboxMode.Comfort,
    public aggressionLevel: GearboxAggressionLevel = GearboxAggressionLevel.LOW,
    public currentGear: number = null,
  ) {
  }
}
