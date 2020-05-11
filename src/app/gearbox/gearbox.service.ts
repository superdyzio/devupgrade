import { Injectable, OnDestroy } from '@angular/core';
import { Gearbox, GearboxAggressionLevel, GearboxMode, GearboxPosition } from './gearbox';
import { EngineService } from '../engine/engine.service';
import { Subscription } from 'rxjs';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { PedalsService } from '../pedals/pedals.service';
import { GEARBOX_CHARACTERISTICS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class GearboxService implements OnDestroy {
  private gearbox: Gearbox;
  private gearboxDriver: Subscription;

  constructor(
    private engine: EngineService,
    private pedalsService: PedalsService
  ) {
    this.gearbox = new Gearbox(
      6,
      GEARBOX_CHARACTERISTICS
    );

    this.gearboxDriver = this.engine.currentRpm$
      .pipe(
        filter(() => this.gearbox.isPositionDrive()),
        withLatestFrom(this.pedalsService.pedalState$),
        tap(([rpm, pedals]) => console.log(rpm, pedals, this.gearbox.currentGear)),
        map(([rpm, pedals]) => ({
          rpm,
          pedals,
          kickdownGearDecreaseCount: this.gearbox.countKickdownGearDecrease(pedals),
          mode: this.gearbox.mode,
        }))
      )
      .subscribe(({rpm, pedals, kickdownGearDecreaseCount, mode}) => {
        switch (mode) {
          case GearboxMode.Eco:
            pedals > 0
              ? this.handleThrottleOnEco(rpm)
              : this.handleBrakeOnEco(rpm, pedals);
            break;
          case GearboxMode.Comfort:
            break;
          case GearboxMode.Sport:
            break;
          default:
            console.error(`Wrong gearbox mode: ${mode}`);
        }
      });
  }

  public ngOnDestroy() {
    this.gearboxDriver.unsubscribe();
  }

  public handleGearboxPositionChange(gearboxPosition: GearboxPosition): void {
    this.gearbox.setGearboxPosition(gearboxPosition);
  }

  public handleGearboxModeChange(gearboxMode: GearboxMode): void {
    this.gearbox.setGearboxMode(gearboxMode);
  }

  public handleGearboxAggressionLevelChange(gearboxAggressionLevel: GearboxAggressionLevel): void {
    this.gearbox.setGearboxAggressionLevel(gearboxAggressionLevel);
  }

  public increaseGearManually(): void {
    if (this.gearbox.isPositionDrive() && this.gearbox.increaseGear()) {
      this.engine.handleGearIncreased();
    }
  }

  public decreaseGearManually(): void {
    if (this.gearbox.isPositionDrive() && this.gearbox.decreaseGear()) {
      this.engine.handleGearDecreased();
    }
  }

  private handleThrottleOnEco(rpm: number): void {
    if (rpm >= this.gearbox.getIncreaseGearRpmLevel() && this.gearbox.increaseGear()) {
      this.engine.handleGearIncreased();
    } else if (rpm < this.gearbox.getDecreaseGearRpmLevel() && this.gearbox.decreaseGear()) {
      this.engine.handleGearDecreased();
    }
  }

  private handleBrakeOnEco(rpm: number, pedals: number): void {
    if (pedals < 0 && rpm < this.gearbox.getDecreaseGearRpmLevel(true) && this.gearbox.decreaseGear()) {
      this.engine.handleGearDecreased();
    } else {
      // todo - change gears when engine braking
      this.engine.engineBreak();
    }
  }
}
