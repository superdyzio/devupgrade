import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

import { LeftPaddleService } from '../paddles/left-paddle.service';
import { RightPaddleService } from '../paddles/right-paddle.service';
import { GearboxService } from '../gearbox/gearbox.service';
import { EngineService } from '../engine/engine.service';
import { PedalsService } from '../pedals/pedals.service';
import { GearboxStatus } from '../interfaces';
import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from '../enums';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  public dashboardData$: Observable<[GearboxStatus, number]> = this.gearboxDriver.gearboxStatus$
    .pipe(withLatestFrom(this.engine.currentRpm$));

  constructor(
    private engine: EngineService,
    private gearboxDriver: GearboxService,
    private leftPaddle: LeftPaddleService,
    private rightPaddle: RightPaddleService,
    private pedals: PedalsService
  ) {
  }

  public setPositionToParking(): void {
    this.gearboxDriver.handleGearboxPositionChange(GearboxPosition.Parking);
  }

  public setPositionToNeutral(): void {
    this.gearboxDriver.handleGearboxPositionChange(GearboxPosition.Neutral);
  }

  public setPositionToReverse(): void {
    this.gearboxDriver.handleGearboxPositionChange(GearboxPosition.Reverse);
  }

  public setPositionToDrive(): void {
    this.gearboxDriver.handleGearboxPositionChange(GearboxPosition.Drive);
  }

  public setModeToEco(): void {
    this.gearboxDriver.handleGearboxModeChange(GearboxMode.Eco);
  }

  public setModeToComfort(): void {
    this.gearboxDriver.handleGearboxModeChange(GearboxMode.Comfort);
  }

  public setModeToSport(): void {
    this.gearboxDriver.handleGearboxModeChange(GearboxMode.Sport);
  }

  public setAggressionLevelToLow(): void {
    this.gearboxDriver.handleGearboxAggressionLevelChange(GearboxAggressionLevel.Low);
  }

  public setAggressionLevelToMedium(): void {
    this.gearboxDriver.handleGearboxAggressionLevelChange(GearboxAggressionLevel.Medium);
  }

  public setAggressionLevelToHigh(): void {
    this.gearboxDriver.handleGearboxAggressionLevelChange(GearboxAggressionLevel.High);
  }

  public pushLeftPaddle(): void {
    this.leftPaddle.push();
  }

  public pushRightPaddle(): void {
    this.rightPaddle.push();
  }

  public handlePedalsChange(pedalsState: number): void {
    this.pedals.setPedalsState(pedalsState);
  }
}
