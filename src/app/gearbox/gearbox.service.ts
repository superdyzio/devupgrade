import { Injectable } from '@angular/core';
import { Gearbox, GearboxMode } from './gearbox';

@Injectable({
  providedIn: 'root'
})
export class GearboxService {
  private gearbox: Gearbox;

  constructor() {
    this.gearbox = new Gearbox(
      6,
      {
        [GearboxMode.Eco]: {
          throttle: {
            increaseGearRpmLevel: 2000,
            decreaseGearRpmLevel: 1000,
            maxThrottleLevel: null
          },
          brake: {
            decreaseGearRpmLevel: 1500,
          }
        },
        [GearboxMode.Comfort]: {
          throttle: {
            increaseGearRpmLevel: 2500,
            decreaseGearRpmLevel: 1000,
            maxThrottleLevel: 0.5,
            kickdown: {
              decreaseGearMaxRpmLevel: 4500,
              maxThrottleLevel: null,
              nextLevelKickdown: null
            }
          },
          brake: {
            decreaseGearRpmLevel: 2000
          }
        },
        [GearboxMode.Sport]: {
          throttle: {
            increaseGearRpmLevel: 5000,
            decreaseGearRpmLevel: 1500,
            maxThrottleLevel: 0.5,
            kickdown: {
              decreaseGearMaxRpmLevel: 5000,
              maxThrottleLevel: 0.7,
              nextLevelKickdown: {
                decreaseGearMaxRpmLevel: 5000,
                maxThrottleLevel: null,
                nextLevelKickdown: null,
              }
            }
          },
          brake: {
            decreaseGearRpmLevel: 3000
          }
        }
      }
    );
  }
}
