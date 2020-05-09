import { Injectable } from '@angular/core';
import { Paddle } from './paddle';

@Injectable({
  providedIn: 'root'
})
export class RightPaddleService implements Paddle {

  public push(): void {
    console.log('right');
  }
}
