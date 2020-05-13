import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { PedalsService } from '../pedals/pedals.service';
import { map, mapTo, switchMap, tap } from 'rxjs/operators';
import { MAX_RPM, MIN_RPM, REFRESH_STATE_INTERVAL_MS, RPM_LOSS_ON_ENGINE_BRAKE, RPM_STEP } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {
  private currentRpm = 0;
  private pedalsStateSubscription: Subscription;
  public currentRpm$: Observable<number> = interval(REFRESH_STATE_INTERVAL_MS)
    .pipe(map(() => this.currentRpm));

  constructor(private pedalsService: PedalsService) {
    this.pedalsStateSubscription = this.pedalsService.pedalState$
      .subscribe((pedalsState: number) => {
        if (pedalsState > 0) {
          this.accelerate(pedalsState);
        } else if (pedalsState < 0) {
          this.decelerate();
        } else {
          this.engineBreak();
        }
      });
  }

  public ngOnDestroy() {
    this.pedalsStateSubscription.unsubscribe();
  }

  public turnOn(): void {
    this.setCurrentRpm(MIN_RPM);
  }

  public turnOff(): void {
    this.setCurrentRpm(0);
  }

  private accelerate(throttleLevel: number): void {
    this.setCurrentRpm(
      Math.min(
        Math.max(this.currentRpm + throttleLevel * RPM_STEP, MIN_RPM),
        MAX_RPM
      )
    );
  }

  private decelerate(): void {
    this.setCurrentRpm(
      Math.max(this.currentRpm - RPM_STEP, MIN_RPM)
    );
  }

  public engineBreak(): void {
    if (this.currentRpm - RPM_LOSS_ON_ENGINE_BRAKE >= MIN_RPM) {
      this.setCurrentRpm(this.currentRpm - RPM_LOSS_ON_ENGINE_BRAKE);
    } else {
      this.setCurrentRpm(MIN_RPM);
    }
  }

  public handleGearIncreased(): void {
    this.setCurrentRpm(this.currentRpm - 2 * RPM_STEP);
  }

  public handleGearDecreased(): void {
    this.setCurrentRpm(this.currentRpm + RPM_STEP);
  }

  private setCurrentRpm(rpm: number): void {
    this.currentRpm = rpm;
  }
}
