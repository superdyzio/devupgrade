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
  private isKickDown: boolean;
  private kickdownDecreaseCounter: number = null;

  constructor(
    private engine: EngineService,
    private pedalsService: PedalsService
  ) {
    this.gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS);

    this.gearboxDriver = this.pedalsService.pedalState$
      .pipe(
        filter(() => this.gearbox.isPositionDrive()),
        tap(pedals => this.setKickDownFlags(pedals)),
        withLatestFrom(this.engine.currentRpm$),
        tap(([pedals, rpm]) => console.log(rpm, pedals, this.gearbox.currentGear)),
        map(([pedals, rpm]) => ({
          pedals,
          rpm,
          mode: this.gearbox.mode,
        }))
      )
      .subscribe(({rpm, pedals, mode}) => {

        if (this.pedalsService.arePedalsReleased()) {
          this.handleEngineBraking(rpm);
          return;
        }

        switch (mode) {
          case GearboxMode.Eco:
            pedals > 0
              ? this.handleThrottleOnEco(rpm)
              : this.handleBrakeOnEco(rpm);
            break;
          case GearboxMode.Comfort:
            pedals > 0
              ? this.handleThrottle(rpm, pedals)
              : this.handleBrake(rpm);
            break;
          case GearboxMode.Sport:
            pedals > 0
              ? this.handleThrottle(rpm, pedals)
              : this.handleBrake(rpm);
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

  private setKickDownFlags(pedals: number): void {
    const isKickDown = pedals > this.gearbox.getMaxThrottleLevel();
    if (isKickDown && isKickDown !== this.isKickDown) {
      this.kickdownDecreaseCounter = this.gearbox.countKickdownGearDecrease(pedals);
    }
    this.isKickDown = pedals > this.gearbox.getMaxThrottleLevel();
  }

  private handleEngineBraking(rpm: number): void {
    if (rpm < this.gearbox.getDecreaseGearRpmLevel(true)) {
      if (this.gearbox.decreaseGear()) {
        this.engine.handleGearDecreased();
      } else {
        this.engine.engineBreak();
      }
    }
  }

  private handleThrottleOnEco(rpm: number): void {
    if (rpm >= this.gearbox.getIncreaseGearRpmLevel() && this.gearbox.increaseGear()) {
      this.engine.handleGearIncreased();
    } else if (rpm < this.gearbox.getDecreaseGearRpmLevel() && this.gearbox.decreaseGear()) {
      this.engine.handleGearDecreased();
    }
  }

  private handleBrakeOnEco(rpm: number): void {
    if (rpm < this.gearbox.getDecreaseGearRpmLevel(true) && this.gearbox.decreaseGear()) {
      this.engine.handleGearDecreased();
    }
  }

  private handleThrottle(rpm, pedals): void {
    if (this.isKickDown) {
      const kickDownDecreaseGearMaxRpmLevel = this.gearbox.getKickdownDecreaseGearMaxRpmLevel(pedals);
      if (this.kickdownDecreaseCounter > 0 && rpm <= kickDownDecreaseGearMaxRpmLevel) {
        this.kickdownDecreaseCounter--;
        if (this.gearbox.decreaseGear()) {
          this.engine.handleGearDecreased();
        }
      } else if (rpm > kickDownDecreaseGearMaxRpmLevel && this.gearbox.increaseGear()) {
        this.kickdownDecreaseCounter--;
        this.engine.handleGearIncreased();
      }
    } else {
      if (rpm >= this.gearbox.getIncreaseGearRpmLevel() && this.gearbox.increaseGear()) {
        this.engine.handleGearIncreased();
      } else if (rpm < this.gearbox.getDecreaseGearRpmLevel() && this.gearbox.decreaseGear()) {
        this.engine.handleGearDecreased();
      }
    }
  }

  private handleBrake(rpm): void {
    if (rpm < this.gearbox.getDecreaseGearRpmLevel(true) && this.gearbox.decreaseGear()) {
      this.engine.handleGearDecreased();
    }
  }
}
