import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { REFRESH_STATE_INTERVAL_MS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class PedalsService {
  private currentPedalsState = 0;
  public pedalsState$: Observable<number> = interval(REFRESH_STATE_INTERVAL_MS)
    .pipe(map(() => this.currentPedalsState));

  public setPedalsState(pedalsState: number): void {
    this.currentPedalsState = pedalsState;
  }

  public arePedalsReleased(): boolean {
    return this.currentPedalsState === 0;
  }
}
