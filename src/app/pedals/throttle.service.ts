import { Injectable } from '@angular/core';
import { EngineService } from '../engine/engine.service';

@Injectable({
  providedIn: 'root'
})
export class ThrottleService {
  constructor(private engine: EngineService) { }

  public push(): void {
    this.engine.accelerate();
  }
}
