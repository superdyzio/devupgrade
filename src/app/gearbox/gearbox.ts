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
  Low = 1,
  Medium = 2,
  High = 3,
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
    public aggressionLevel: GearboxAggressionLevel = GearboxAggressionLevel.Low,
    public currentGear: number = null,
  ) {
  }

  public getIncreaseGearRpmLevel(): number {
    return this.characteristics[this.mode].throttle.increaseGearRpmLevel;
  }

  public getDecreaseGearRpmLevel(isBraking: boolean = false): number {
    return this.characteristics[this.mode][isBraking ? 'brake' : 'throttle'].decreaseGearRpmLevel;
  }

  public setGearboxPosition(gearboxPosition: GearboxPosition): void {
    this.position = gearboxPosition;
    this.currentGear = gearboxPosition === GearboxPosition.Drive ? 1 : null;
  }

  public setGearboxMode(gearboxMode: GearboxMode): void {
    this.mode = gearboxMode;
  }

  public setGearboxAggressionLevel(gearboxAggressionLevel: GearboxAggressionLevel): void {
    this.aggressionLevel = gearboxAggressionLevel;
  }

  public isPositionDrive(): boolean {
    return this.position === GearboxPosition.Drive;
  }

  public countKickdownGearDecrease(pedalsState: number): number {
    return this.characteristics[this.mode].throttle.maxThrottleLevel
      ? this.isKickdownThresholdCrossed(pedalsState, this.characteristics[this.mode].throttle.kickdown)
      : 0;
  }

  private isKickdownThresholdCrossed(
    pedalsState: number,
    kickdownCharacteristics: GearboxKickdownCharacteristics
  ): number {
    return kickdownCharacteristics.maxThrottleLevel && pedalsState > kickdownCharacteristics.maxThrottleLevel
      ? 1 + this.isKickdownThresholdCrossed(pedalsState, kickdownCharacteristics.nextLevelKickdown)
      : 1;
  }

  public increaseGear(): boolean {
    if (this.currentGear === this.maxGear) {
      return false;
    }

    this.currentGear++;

    return true;
  }

  public decreaseGear(): boolean {
    if (this.currentGear === 1) {
      return false;
    }

    this.currentGear--;

    return true;
  }
}
