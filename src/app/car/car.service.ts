import { Injectable } from '@angular/core';
import { LeftPaddleService } from '../paddles/left-paddle.service';
import { RightPaddleService } from '../paddles/right-paddle.service';
import { GearboxService } from '../gearbox/gearbox.service';
import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from '../gearbox/gearbox';
import { ThrottleService } from '../pedals/throttle.service';
import { BrakeService } from '../pedals/brake.service';
import { PedalsService } from '../pedals/pedals.service';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  constructor(
    private gearbox: GearboxService,
    private leftPaddle: LeftPaddleService,
    private rightPaddle: RightPaddleService,
    private throttle: ThrottleService,
    private brake: BrakeService,
    private pedals: PedalsService,
  ) { }

  public setPositionToParking(): void {
    this.gearbox.handleGearboxPositionChange(GearboxPosition.Parking);
  }

  public setPositionToNeutral(): void {
    this.gearbox.handleGearboxPositionChange(GearboxPosition.Neutral);
  }

  public setPositionToReverse(): void {
    this.gearbox.handleGearboxPositionChange(GearboxPosition.Reverse);
  }

  public setPositionToDrive(): void {
    this.gearbox.handleGearboxPositionChange(GearboxPosition.Drive);
  }

  public setModeToEco(): void {
    this.gearbox.handleGearboxModeChange(GearboxMode.Eco);
  }

  public setModeToComfort(): void {
    this.gearbox.handleGearboxModeChange(GearboxMode.Comfort);
  }

  public setModeToSport(): void {
    this.gearbox.handleGearboxModeChange(GearboxMode.Sport);
  }

  public setAggressionLevelToLow(): void {
    this.gearbox.handleGearboxAggressionLevelChange(GearboxAggressionLevel.Low);
  }

  public setAggressionLevelToMedium(): void {
    this.gearbox.handleGearboxAggressionLevelChange(GearboxAggressionLevel.Medium);
  }

  public setAggressionLevelToHigh(): void {
    this.gearbox.handleGearboxAggressionLevelChange(GearboxAggressionLevel.High);
  }

  public pushLeftPaddle(): void {
    this.leftPaddle.push();
  }

  public pushRightPaddle(): void {
    this.rightPaddle.push();
  }

  public pushThrottlePedal(): void {
    this.throttle.push();
  }

  public pushBrakePedal(): void {
    this.brake.push();
  }

  public releasePedals(): void {
    this.pedals.setPedalState(0);
  }
}
