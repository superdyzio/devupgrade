import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  public static MAX_RPM = 7000;
  public static MIN_RPM = 500;
  public currentRpm: BehaviorSubject<number> = new BehaviorSubject<number>(EngineService.MIN_RPM);

  public accelerate(): void {
    if (this.currentRpm.value < EngineService.MAX_RPM) {
      this.currentRpm.next(this.currentRpm.value + 500);
    }
  }

  public decelerate(): void {
    if (this.currentRpm.value > EngineService.MIN_RPM) {
      this.currentRpm.next(this.currentRpm.value - 500);
    }
  }

  public handleGearIncreased(): void {
    this.currentRpm.next(this.currentRpm.value - 1000);
  }

  public handleGearDecreased(): void {
    this.currentRpm.next(this.currentRpm.value + 500);
  }
}
