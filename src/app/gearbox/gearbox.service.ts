import { Injectable, OnDestroy } from '@angular/core';
import { Gearbox, GearboxAggressionLevel, GearboxMode, GearboxPosition, GearboxStatus } from './gearbox';
import { EngineService } from '../engine/engine.service';
import { tap, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { PedalsService } from '../pedals/pedals.service';
import { GEARBOX_CHARACTERISTICS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class GearboxService implements OnDestroy {
  private gearbox: Gearbox;
  private gearboxDriver: Subscription;
  private isKickdown: boolean;
  private kickdownDecreaseCounter: number = null;
  private gearboxStatusSubject: BehaviorSubject<GearboxStatus>;
  public gearboxStatus$: Observable<GearboxStatus>;

  constructor(
    private engine: EngineService,
    private pedalsService: PedalsService
  ) {
    this.gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS);

    this.gearboxStatusSubject = new BehaviorSubject<GearboxStatus>({
      position: this.gearbox.position,
      mode: this.gearbox.mode,
      aggressionLevel: this.gearbox.aggressionLevel,
      currentGear: this.gearbox.currentGear
    });
    this.gearboxStatus$ = this.gearboxStatusSubject.asObservable();

    this.gearboxDriver = this.pedalsService.pedalState$
      .pipe(
        tap(() => {
          this.gearboxStatusSubject.next({
            position: this.gearbox.position,
            mode: this.gearbox.mode,
            aggressionLevel: this.gearbox.aggressionLevel,
            currentGear: this.gearbox.currentGear
          });
        }),
        tap(pedals => this.setKickdownFlags(pedals)),
        withLatestFrom(this.engine.currentRpm$),
        tap(([pedals, rpm]) => console.log(rpm, pedals, this.gearbox.currentGear)),
      )
      .subscribe(([pedals, rpm]) => {
        if (this.position === GearboxPosition.Parking && rpm > 0) {
          this.engine.turnOff();
        }
        if (this.position !== GearboxPosition.Parking && rpm === 0) {
          this.engine.turnOn();
        }

        if (this.position === GearboxPosition.Neutral) {
          return;
        }

        if (this.pedalsService.arePedalsReleased()) {
          this.handleEngineBraking(rpm);
        } else if (this.isKickdown) {
          this.handleKickdown(rpm, pedals);
        } else {
          pedals > 0
            ? this.handleThrottle(rpm)
            : this.handleBrake(rpm);
        }
      });
  }

  public get position(): GearboxPosition {
    return this.gearboxStatusSubject.value.position;
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

  private setKickdownFlags(pedals: number): void {
    const isKickdown = pedals > this.gearbox.getMaxThrottleLevel();
    if (isKickdown && isKickdown !== this.isKickdown) {
      this.kickdownDecreaseCounter = this.gearbox.countKickdownGearDecrease(pedals);
    }
    this.isKickdown = pedals > this.gearbox.getMaxThrottleLevel();
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

  private handleThrottle(rpm): void {
    if (rpm >= this.gearbox.getIncreaseGearRpmLevel() && this.gearbox.increaseGear()) {
      this.engine.handleGearIncreased();
    } else if (rpm < this.gearbox.getDecreaseGearRpmLevel() && this.gearbox.decreaseGear()) {
      this.engine.handleGearDecreased();
    }
  }

  private handleKickdown(rpm: number, pedals: number): void {
    const kickdownDecreaseGearMaxRpmLevel = this.gearbox.getKickdownDecreaseGearMaxRpmLevel(pedals);
    if (this.kickdownDecreaseCounter > 0 && rpm <= kickdownDecreaseGearMaxRpmLevel) {
      this.kickdownDecreaseCounter--;
      if (this.gearbox.decreaseGear()) {
        this.engine.handleGearDecreased();
      }
    } else if (rpm > kickdownDecreaseGearMaxRpmLevel && this.gearbox.increaseGear()) {
      this.kickdownDecreaseCounter--;
      this.engine.handleGearIncreased();
    }
  }

  private handleBrake(rpm): void {
    if (rpm < this.gearbox.getDecreaseGearRpmLevel(true) && this.gearbox.decreaseGear()) {
      this.engine.handleGearDecreased();
    }
  }
}
