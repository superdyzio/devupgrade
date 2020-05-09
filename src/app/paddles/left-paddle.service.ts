import { Injectable } from '@angular/core';
import { Paddle } from './paddle';

@Injectable({
  providedIn: 'root'
})
export class LeftPaddleService implements Paddle {

  constructor() { }

  public push(): void {
    console.log('left');
  }
}
