import { Injectable } from '@angular/core';
import { Paddle } from './paddle';
import { GearboxService } from '../gearbox/gearbox.service';

@Injectable({
  providedIn: 'root'
})
export class LeftPaddleService implements Paddle {
  constructor(private gearbox: GearboxService) { }

  public push(): void {
    this.gearbox.decreaseGearManually();
  }
}
