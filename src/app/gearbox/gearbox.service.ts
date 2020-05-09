import { Injectable, OnDestroy } from '@angular/core';
import { Gearbox, GearboxAggressionLevel, GearboxMode, GearboxPosition } from './gearbox';
import { EngineService } from '../engine/engine.service';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GearboxService implements OnDestroy {
  private gearbox: Gearbox;
  private currentRpmSubscription: Subscription;

  constructor(private engine: EngineService) {
    this.gearbox = new Gearbox(
      6,
      {
        [GearboxMode.Eco]: {
          throttle: {
            increaseGearRpmLevel: 2000,
            decreaseGearRpmLevel: 1000,
            maxThrottleLevel: null
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
            kickdown: {
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
            kickdown: {
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
      }
    );

    this.currentRpmSubscription = this.engine.currentRpm.pipe(
      filter(() => this.gearbox.isPositionDrive() && this.gearbox.isModeEco())
    ).subscribe((rpm: number) => {
      if (rpm >= this.gearbox.getIncreaseGearRpmLevel() && this.gearbox.increaseGear()) {
        this.engine.handleGearIncreased();
        return;
      }

      if (rpm < this.gearbox.getDecreaseGearRpmLevel() && this.gearbox.decreaseGear()) {
        this.engine.handleGearDecreased();
        return;
      }
    });
  }

  public ngOnDestroy() {
    this.currentRpmSubscription.unsubscribe();
  }

  public handleGearboxPositionChange(gearboxPosition: GearboxPosition): void {
    this.gearbox.setGearboxPosition(gearboxPosition);
  }

  public handleGearboxModeChange(gearboxMode: GearboxMode): void {
    this.gearbox.setGearboxMode(gearboxMode)
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
}
