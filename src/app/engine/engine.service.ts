import { Injectable, OnDestroy } from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import { PedalsService } from '../pedals/pedals.service';
import { map } from 'rxjs/operators';
import { REFRESH_STATE_INTERVAL_MS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {
  private static MAX_RPM = 7000;
  private static MIN_RPM = 500;
  private static RPM_STEP = 500;
  private static RPM_LOSS_ON_ENGINE_BRAKE = 200;
  private currentRpm: number = EngineService.MIN_RPM;
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

  private accelerate(throttleLevel: number): void {
    const rpmIncrease = throttleLevel * EngineService.RPM_STEP;
    if (this.currentRpm + rpmIncrease <= EngineService.MAX_RPM) {
      this.setCurrentRpm(
        this.currentRpm + throttleLevel * EngineService.RPM_STEP
      );
    } else {
      this.setCurrentRpm(EngineService.MAX_RPM);
    }
  }

  private decelerate(): void {
    if (this.currentRpm - EngineService.RPM_STEP >= EngineService.MIN_RPM) {
      this.setCurrentRpm(this.currentRpm - EngineService.RPM_STEP);
    } else {
      this.setCurrentRpm(EngineService.MIN_RPM);
    }
  }

  public engineBreak(): void {
    if (this.currentRpm - EngineService.RPM_LOSS_ON_ENGINE_BRAKE >= EngineService.MIN_RPM) {
      this.setCurrentRpm(this.currentRpm - EngineService.RPM_LOSS_ON_ENGINE_BRAKE);
    } else {
      this.setCurrentRpm(EngineService.MIN_RPM);
    }
  }

  public handleGearIncreased(): void {
    this.setCurrentRpm(this.currentRpm - 2 * EngineService.RPM_STEP);
  }

  public handleGearDecreased(): void {
    this.setCurrentRpm(this.currentRpm + EngineService.RPM_STEP);
  }

  private setCurrentRpm(rpm: number): void {
    this.currentRpm = rpm;
  }
}
