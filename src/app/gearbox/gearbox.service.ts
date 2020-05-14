import { Injectable, OnDestroy } from '@angular/core';
import { tap, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { Gearbox } from './gearbox';
import { EngineService } from '../engine/engine.service';
import { PedalsService } from '../pedals/pedals.service';
import { GEARBOX_CHARACTERISTICS } from '../constants';
import { GearboxStatus } from '../interfaces';
import { GearboxAggressionLevel, GearboxMode, GearboxPosition } from '../enums';

@Injectable({
  providedIn: 'root'
})
export class GearboxService implements OnDestroy {
  public gearboxStatus$: Observable<GearboxStatus>;
  private gearboxStatusSubject: BehaviorSubject<GearboxStatus>;
  private readonly gearbox: Gearbox;
  private pedalsStateSubscription: Subscription;
  private isKickdown: boolean;
  private kickdownDecreaseCounter: number = null;

  constructor(
    private engine: EngineService,
    private pedals: PedalsService
  ) {
    this.gearbox = new Gearbox(6, GEARBOX_CHARACTERISTICS);
    this.gearboxStatusSubject = new BehaviorSubject<GearboxStatus>(this.getCurrentGearboxStatus());
    this.gearboxStatus$ = this.gearboxStatusSubject.asObservable();

    this.pedalsStateSubscription = this.pedals.pedalsState$
      .pipe(
        tap(() => this.setCurrentGearboxStatus()),
        tap(pedalsState => this.setKickdownFlags(pedalsState)),
        withLatestFrom(this.engine.currentRpm$),
      )
      .subscribe(([pedalsState, rpm]) => {
        if (this.gearbox.isPositionParking() && rpm > 0) {
          this.engine.turnOff();
        }
        if (!this.gearbox.isPositionParking() && rpm === 0) {
          this.engine.turnOn();
        }

        if (this.gearbox.isPositionNeutral() || this.gearbox.isPositionParking()) {
          return;
        }

        if (this.pedals.arePedalsReleased()) {
          this.handleEngineBraking(rpm);
        } else if (this.isKickdown) {
          this.handleKickdown(rpm, pedalsState);
        } else {
          pedalsState > 0
            ? this.handleThrottle(rpm)
            : this.handleBrake(rpm);
        }
      });
  }

  public ngOnDestroy() {
    this.pedalsStateSubscription.unsubscribe();
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

  public get gearboxStatus(): GearboxStatus {
    return this.gearboxStatusSubject.value;
  }

  private getCurrentGearboxStatus(): GearboxStatus {
    const {position, mode, aggressionLevel, currentGear}: Gearbox = this.gearbox;
    return {
      position, mode, aggressionLevel, currentGear,
      allowManualGearChange: position === GearboxPosition.Drive,
      allowAggressionLevelChange: mode === GearboxMode.Sport,
    };
  }

  private setCurrentGearboxStatus(): void {
    this.gearboxStatusSubject.next(this.getCurrentGearboxStatus());
  }

  private setKickdownFlags(pedalsState: number): void {
    const isKickdown = pedalsState > this.gearbox.getMaxThrottleLevel();
    if (isKickdown && isKickdown !== this.isKickdown) {
      this.kickdownDecreaseCounter = this.gearbox.countKickdownGearDecrease(pedalsState);
    }
    this.isKickdown = pedalsState > this.gearbox.getMaxThrottleLevel();
  }

  private handleEngineBraking(rpm: number): void {
    if (rpm < this.gearbox.getDecreaseGearRpmLevel(true)) {
      if (this.gearbox.decreaseGear()) {
        this.engine.handleGearDecreased();
      } else {
        this.engine.engineBrake();
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

  private handleKickdown(rpm: number, pedalsState: number): void {
    const kickdownDecreaseGearMaxRpmLevel = this.gearbox.getKickdownDecreaseGearMaxRpmLevel(pedalsState);
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
