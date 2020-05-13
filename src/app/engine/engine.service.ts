import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { PedalsService } from '../pedals/pedals.service';
import { MAX_RPM, MIN_RPM, RPM_LOSS_ON_ENGINE_BRAKE, RPM_STEP } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {
  private isWorking = false;
  private currentRpmSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private pedalsStateSubscription: Subscription;
  public currentRpm$: Observable<number> = this.currentRpmSubject.asObservable();

  constructor(private pedals: PedalsService) {
    this.pedalsStateSubscription = this.pedals.pedalsState$
      .subscribe((pedalsState: number) => {
        if (!this.isWorking) {
          return;
        }

        if (pedalsState > 0) {
          this.accelerate(pedalsState);
        } else if (pedalsState < 0) {
          this.decelerate(pedalsState);
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
    this.isWorking = true;
  }

  public turnOff(): void {
    this.setCurrentRpm(0);
    this.isWorking = false;
  }

  private accelerate(throttleLevel: number): void {
    this.setCurrentRpm(
      Math.min(
        Math.max(this.currentRpm + throttleLevel * RPM_STEP, MIN_RPM),
        MAX_RPM
      )
    );
  }

  private decelerate(brakeLevel: number): void {
    this.setCurrentRpm(
      Math.max(this.currentRpm - Math.abs(brakeLevel) * RPM_STEP, MIN_RPM)
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
    this.setCurrentRpm(Math.floor(this.currentRpm - this.currentRpm * .5));
  }

  public handleGearDecreased(): void {
    this.setCurrentRpm(Math.floor(this.currentRpm + this.currentRpm * .3));
  }

  private get currentRpm(): number {
    return this.currentRpmSubject.value;
  }

  private setCurrentRpm(rpm: number): void {
    this.currentRpmSubject.next(rpm);
  }
}
