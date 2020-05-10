import { Injectable } from '@angular/core';
import { PedalsService } from './pedals.service';

@Injectable({
  providedIn: 'root'
})
export class BrakeService {
  constructor(private pedalsService: PedalsService) { }

  public push(): void {
    this.pedalsService.setPedalState(-1);
  }
}
