import { Injectable } from '@angular/core';
import { EngineService } from '../engine/engine.service';

@Injectable({
  providedIn: 'root'
})
export class BrakeService {
  constructor(private engine: EngineService) { }

  public push(): void {
    this.engine.decelerate();
  }
}
