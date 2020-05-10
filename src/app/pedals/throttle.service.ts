import { Injectable } from '@angular/core';
import { PedalsService } from './pedals.service';

@Injectable({
  providedIn: 'root'
})
export class ThrottleService {
  constructor(private pedalsService: PedalsService) { }

  public push(): void {
    const throttleLevel = 0.3;
    this.pedalsService.setPedalState(throttleLevel);
  }
}
